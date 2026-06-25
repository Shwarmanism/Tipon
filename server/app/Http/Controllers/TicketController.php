<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // Needed for generating the UUID

class TicketController extends Controller
{
    public function list()
    {

        $tickets = DB::table('tickets')
            ->join('events', 'tickets.event_id', 'events.id')
            ->where('tickets.user_id', Auth::id())
            ->select('tickets.*', 'events.title', 'events.event_date', 'events.venue')
            ->get();

        $formatted = $tickets->map(function ($ticket) {
            return [
                'id' => $ticket->id,
                'ticketCode' => 'TK - ' . str_pad($ticket->id, 3, '0', STR_PAD_LEFT),
                'qrUrl' => null, // Placeholder for actual QR URL
                'status' => $ticket->status,
                'event' => [
                    'id' => $ticket->event_id,
                    'title' => $ticket->title,
                    'date' => \Carbon\Carbon::parse($ticket->event_date)->format('D M d, Y \– g:i A'),
                    'venue' => $ticket->venue,
                ]
            ];
        });

        return response()->json($formatted);
    }

   
    public function showQR($id)
    {
        $ticket = DB::table('tickets')
                    ->where('id', $id)
                    ->where('user_id', Auth::id())
                    ->first();

        if (!$ticket) return response()->json(['error' => 'Ticket not found'], 404);

        $event = DB::table('events')->where('id', $ticket->event_id)->first();
        if (!$event) return response()->json(['error' => 'Event not found'], 404);

        $registeredCount = DB::table('tickets')
            ->where('event_id', $event->id)
            ->where('status', 'active')
            ->count();

        $ticketData = [
            'id' => $ticket->id,
            'ticketCode' => 'TK - ' . str_pad($ticket->id, 3, '0', STR_PAD_LEFT),
            'qrUrl' => null,
            'eventStartsAt' => $event->event_date,
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'date' => \Carbon\Carbon::parse($event->event_date)->format('D M d, Y \– g:i A'),
                'venue' => $event->venue,
                'category' => $event->category,
                'description' => $event->description,
                'targetAudience' => $event->target_audience,
                'totalSlots' => $event->total_slots,
                'registeredCount' => $registeredCount,
                'waitlistedCount' => 0, // Simplified for now
                'posterUrl' => null,
            ]
        ];

        return response()->json(['ticket' => $ticketData]);
    }


    public function store(Request $request, $event_id)
    {
    
        return DB::transaction(function () use ($event_id) {
            
            $event = DB::table('events')->where('id', $event_id)->lockForUpdate()->first();
            if (!$event) return response()->json(['error' => 'Event not found'], 404);

            $existingTicket = DB::table('tickets')
                                ->where('user_id', Auth::id())
                                ->where('event_id', $event_id)
                                ->whereIn('status', ['active', 'waitlisted'])
                                ->first();

            if ($existingTicket) {
                return response()->json(['error' => 'You are already registered or waitlisted for this event.'], 400);
            }

            $activeCount = DB::table('tickets')->where('event_id', $event_id)->where('status', 'active')->count();

            $status = ($activeCount < $event->total_slots) ? 'active' : 'waitlisted';

            
            $ticketId = DB::table('tickets')->insertGetId([
                'user_id' => Auth::id(),
                'event_id' => $event_id,
                'qr_code_uuid' => Str::uuid(),
                'status' => $status
            ]);

            if ($status === 'waitlisted') {
                return response()->json(['success' => true, 'status' => 'waitlisted', 'message' => 'Event is full. You have been added to the waitlist!', 'ticket_id' => $ticketId]);
            }

            return response()->json(['success' => true, 'status' => 'active', 'message' => 'Successfully registered! Your ticket is now in your wallet.', 'ticket_id' => $ticketId]);
        });
    }


    public function cancel($id)
    {
        return DB::transaction(function () use ($id) {
            $ticket = DB::table('tickets')
                        ->where('id', $id)
                        ->where('user_id', Auth::id())
                        ->first();

            if (!$ticket) return response()->json(['error' => 'Ticket not found'], 404);

            // Mark the student's ticket as cancelled
            DB::table('tickets')
                ->where('id', $id)
                ->update(['status' => 'cancelled']);

            // Automatic Waitlist Allocation Logic
            // Find the oldest waitlisted ticket for this specific event
            $nextInQueue = DB::table('tickets')
                                 ->where('event_id', $ticket->event_id)
                                 ->where('status', 'waitlisted')
                                 ->orderBy('created_at', 'asc')
                                 ->first();

            // If someone was waiting in line, upgrade their status to active
            if ($nextInQueue) {
                DB::table('tickets')
                    ->where('id', $nextInQueue->id)
                    ->update(['status' => 'active']);
            }

            return response()->json(['success' => true, 'message' => 'Your registration has been cancelled.']);
        });
    }
}