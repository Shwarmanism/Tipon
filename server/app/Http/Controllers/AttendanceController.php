<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
  
    public function scannerPage($event_id)
    {

        $event = DB::table('events')->where('id', $event_id)->first();
        
        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        // Fetch attendees for this event (only active and waitlisted, active first)
        $attendees = DB::table('tickets')
            ->join('users', 'tickets.user_id', '=', 'users.id')
            ->leftJoin('attendances', 'tickets.id', '=', 'attendances.ticket_id')
            ->where('tickets.event_id', $event_id)
            ->whereIn('tickets.status', ['active', 'waitlisted'])
            ->select(
                'tickets.id',
                'tickets.status',
                'users.name',
                'users.email as studentNo',
                DB::raw('IF(attendances.id IS NOT NULL, true, false) as attended')
            )
            ->orderByRaw("FIELD(tickets.status, 'active', 'waitlisted')")
            ->orderBy('users.name', 'asc')
            ->get();

        return response()->json([
            'event' => $event,
            'attendees' => $attendees
        ]);
    }

    public function scanQrCode(Request $request)
    {
        $request->validate([
            'qr_code_uuid' => 'required|string',
            'event_id' => 'required|integer'
        ]);

        $ticket = DB::table('tickets')
                    ->where('qr_code_uuid', $request->qr_code_uuid)
                    ->where('event_id', $request->event_id)
                    ->where('status', 'active')
                    ->first();

        if (!$ticket) {
            return response()->json(['error' => 'Invalid QR Code or Ticket is inactive.'], 400);
        }

        $alreadyCheckedIn = DB::table('attendances')
                              ->where('ticket_id', $ticket->id)
                              ->exists();
        
        if ($alreadyCheckedIn) {
            return response()->json(['warning' => 'This ticket has already been scanned!'], 400);
        }

        DB::table('attendances')->insert([
            'ticket_id' => $ticket->id,
            'scanned_by' => Auth::id(), // Records which Admin scanned the code
            'check_in_time' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Student successfully checked in!']);
    }

    public function manualCheckIn(Request $request)
    {
        $request->validate([
            'ticket_id' => 'required|integer'
        ]);

        $alreadyCheckedIn = DB::table('attendances')
                              ->where('ticket_id', $request->ticket_id)
                              ->exists();

        if ($alreadyCheckedIn) {
            return response()->json(['warning' => 'User is already checked in.'], 400);
        }

        DB::table('attendances')->insert([
            'ticket_id' => $request->ticket_id,
            'scanned_by' => Auth::id(),
            'check_in_time' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Manual check-in successful.']);
    }
}