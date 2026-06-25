<?php

namespace App\Http\Controllers;

use App\Models\Event;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    public function index()
    {
        $events = DB::table('events')
                    ->where('event_date', '>=', now()->toDateString())
                    ->orderBy('event_date', 'asc')
                    ->get();

        return view('welcome', compact('events'));
    }

    public function show($id)
    {
        $event = DB::table('events')->where('id', $id)->firstOrFail();

        return view('event.show', compact('event'));
    }

    public function dashboard()
    {
        $events = DB::table('events')
                    ->where('creator_id', Auth::id())
                    ->orderBy('event_date', 'asc')
                    ->get();

        return view('admin.dashboard', compact('events'));
    }

    public function createForm()
    {
        return view('admin.events.create');
    }

    public function store(Request $request)
    {
        // 1. Validate the form inputs
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'event_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'venue' => 'required|string',
            'total_slots' => 'required|integer|min:1',
        ]);

        // 2. Insert into the database using Query Builder
        DB::table('events')->insert([
            'creator_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'event_date' => $request->event_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'venue' => $request->venue,
            'total_slots' => $request->total_slots,
            'created_at' => now(),
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'Event successfully published!');
    }

    public function editEvent($id)
    {
        $event = DB::table('events')->where('id', $id)->first();
        if (!$event) abort(404);

        return view('admin.events.edit', compact('event'));
    }

    public function updateSubmit(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'event_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'venue' => 'required|string',
            'total_slots' => 'required|integer|min:1',
        ]);

        DB::table('events')->where('id', $id)->update([
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'event_date' => $request->event_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'venue' => $request->venue,
            'total_slots' => $request->total_slots,
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'Event updated successfully!');
    }

    public function delete($id)
    {
        DB::table('events')->where('id', $id)->delete();

        return redirect()->route('admin.dashboard')->with('success', 'Event deleted successfully.');
    }


    public function reportYield($event_id)
    {
        $event = DB::table('events')->where('id', $event_id)->first();
        if (!$event) abort(404);


        $totalRegistered = DB::table('tickets')
                            ->where('event_id', $event_id)
                            ->where('status', 'active')
                            ->count();

        $totalAttended = DB::table('attendances')
                           ->join('tickets', 'attendances.ticket_id', '=', 'tickets.id')
                           ->where('tickets.event_id', $event_id)
                           ->count();

        return view('admin.events.report', compact('event', 'totalRegistered', 'totalAttended'));
    }

    public function exportManifest($event_id)
    {
        // In a real application, you would generate a CSV here. 
        // For now, it returns a simple message.
        return back()->with('success', 'Manifest export triggered successfully!');
    }

    public function issueCertificates($event_id)
    {
        // Logic to email PDF certificates to attendees
        return back()->with('success', 'E-Certificates are being sent to all attendees!');
    }
}