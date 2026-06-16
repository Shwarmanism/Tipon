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
            abort(404);
        }

        return view('admin.attendance.scanner', compact('event'));
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
            return back()->with('error', 'Invalid QR Code or Ticket is inactive.');
        }

        $alreadyCheckedIn = DB::table('attendances')
                              ->where('ticket_id', $ticket->id)
                              ->exists();
        
        if ($alreadyCheckedIn) {
            return back()->with('warning', 'This ticket has already been scanned!');
        }

        DB::table('attendances')->insert([
            'ticket_id' => $ticket->id,
            'scanned_by' => Auth::id(), // Records which Admin scanned the code
            'check_in_time' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Student successfully checked in!');
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
            return back()->with('warning', 'User is already checked in.');
        }

        DB::table('attendances')->insert([
            'ticket_id' => $request->ticket_id,
            'scanned_by' => Auth::id(),
            'check_in_time' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Manual check-in successful.');
    }
}