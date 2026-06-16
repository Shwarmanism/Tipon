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
            ->select('tickets.*', 'events.title', 'events.event_date')
            ->get();

        return view('student.tickets.list', compact('tickets'));
    }

   
    public function showQR($id)
    {
        $ticket = DB::table('tickets')
                    ->where('id', $id)
                    ->where('user_id', Auth::id())
                    ->firstOrFail();

        return view('student.tickets.show', compact('ticket'));
    }


    public function store(Request $request, $event_id)
    {
    
        return DB::transaction(function () use ($event_id) {
            
            $event = DB::table('events')->where('id', $event_id)->lockForUpdate()->firstOrFail();

            $existingTicket = DB::table('tickets')
                                ->where('user_id', Auth::id())
                                ->where('event_id', $event_id)
                                ->whereIn('status', ['active', 'waitlisted'])
                                ->first();

            if ($existingTicket) {
                return back()->withErrors(['message' => 'You are already registered or waitlisted for this event.']);
            }

            $activeCount = DB::table('tickets')->where('event_id', $event_id)->where('status', 'active')->count();

            $status = ($activeCount < $event->total_slots) ? 'active' : 'waitlisted';

            
            DB::table('tickets')->insert([
                'user_id' => Auth::id(),
                'event_id' => $event_id,
                'qr_code_uuid' => Str::uuid(),
                'status' => $status
            ]);

            if ($status === 'waitlisted') {
                return redirect()->route('student.tickets')->with('warning', 'Event is full. You have been added to the waitlist!');
            }

            return redirect()->route('student.tickets')->with('success', 'Successfully registered! Your ticket is now in your wallet.');
        });
    }


    public function cancel($id)
    {
        return DB::transaction(function () use ($id) {
            $ticket = DB::table('tickets')
                        ->where('id', $id)
                        ->where('user_id', Auth::id())
                        ->firstOrFail();

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

            return back()->with('success', 'Your registration has been cancelled.');
        });
    }
}