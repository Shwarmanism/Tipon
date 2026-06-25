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
        $userId = Auth::id();

        // Get all events created by the logged-in admin
        $eventsQuery = DB::table('events')->where('creator_id', $userId);
        
        $totalActiveEvents = $eventsQuery->where('event_date', '>=', now()->toDateString())->count();
        
        // Let's get total registrations across all their events
        $totalRegistrations = DB::table('tickets')
            ->join('events', 'tickets.event_id', '=', 'events.id')
            ->where('events.creator_id', $userId)
            ->where('tickets.status', 'active')
            ->count();
            
        // Let's get total attendees checked in
        $totalCheckedIn = DB::table('attendances')
            ->join('tickets', 'attendances.ticket_id', '=', 'tickets.id')
            ->join('events', 'tickets.event_id', '=', 'events.id')
            ->where('events.creator_id', $userId)
            ->count();

        $stats = [
            ['label' => 'Total Active Events', 'value' => $totalActiveEvents],
            ['label' => 'Total Registrations', 'value' => $totalRegistrations],
            ['label' => 'Total Attendees Checked In', 'value' => $totalCheckedIn],
        ];

        $eventsData = DB::table('events')
            ->where('creator_id', $userId)
            ->orderBy('event_date', 'asc')
            ->get();

        $formattedEvents = $eventsData->map(function ($event) {
            // Count active tickets for this event
            $registeredCount = DB::table('tickets')
                ->where('event_id', $event->id)
                ->where('status', 'active')
                ->count();
                
            $percent = $event->total_slots > 0 ? round(($registeredCount / $event->total_slots) * 100) : 0;
            
            // Determine status based on event_date
            $status = 'published';
            if (\Carbon\Carbon::parse($event->event_date)->isPast()) {
                $status = 'cancelled'; // Re-using cancelled for past events, or could add 'completed' if CSS supports it
            }

            return [
                'id' => $event->id,
                'title' => $event->title,
                'category' => $event->category,
                'date' => \Carbon\Carbon::parse($event->event_date)->format('M d, Y'),
                'venue' => $event->venue,
                'registrations' => "{$registeredCount}/{$event->total_slots}",
                'registrationPercent' => $percent,
                'status' => $status,
            ];
        });

        return response()->json([
            'stats' => $stats,
            'events' => $formattedEvents,
        ]);
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
            'target_audience' => 'required|string',
            'event_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'venue' => 'required|string',
            'total_slots' => 'required|integer|min:1',
            'status' => 'required|string|in:draft,published',
        ]);

        // 2. Insert into the database using Query Builder
        $eventId = DB::table('events')->insertGetId([
            'creator_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'target_audience' => $request->target_audience,
            'event_date' => $request->event_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'venue' => $request->venue,
            'total_slots' => $request->total_slots,
            'status' => $request->status,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event successfully ' . ($request->status === 'published' ? 'published!' : 'saved as draft.'),
            'event_id' => $eventId
        ], 201);
    }

    public function editEvent($id)
    {
        $event = DB::table('events')->where('id', $id)->first();
        if (!$event) return response()->json(['error' => 'Event not found'], 404);

        return response()->json(['event' => $event]);
    }

    public function updateSubmit(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'target_audience' => 'required|string',
            'event_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'venue' => 'required|string',
            'total_slots' => 'required|integer|min:1',
            'status' => 'required|string|in:draft,published',
        ]);

        DB::table('events')->where('id', $id)->update([
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'target_audience' => $request->target_audience,
            'event_date' => $request->event_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'venue' => $request->venue,
            'total_slots' => $request->total_slots,
            'status' => $request->status,
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Event updated successfully!']);
    }

    public function delete($id)
    {
        DB::table('events')->where('id', $id)->delete();

        return response()->json(['success' => true, 'message' => 'Event deleted successfully.']);
    }


    public function reportYield($event_id)
    {
        $event = DB::table('events')->where('id', $event_id)->first();
        if (!$event) return response()->json(['error' => 'Event not found'], 404);


        $totalRegistered = DB::table('tickets')
                            ->where('event_id', $event_id)
                            ->where('status', 'active')
                            ->count();

        $totalAttended = DB::table('attendances')
                           ->join('tickets', 'attendances.ticket_id', '=', 'tickets.id')
                           ->where('tickets.event_id', $event_id)
                           ->count();

        $manifest = DB::table('tickets')
            ->join('users', 'tickets.user_id', '=', 'users.id')
            ->leftJoin('attendances', 'tickets.id', '=', 'attendances.ticket_id')
            ->where('tickets.event_id', $event_id)
            ->where('tickets.status', 'active')
            ->select(
                'users.name',
                'users.email',
                'attendances.check_in_time'
            )
            ->get()
            ->map(function($record, $index) {
                return [
                    'no' => $index + 1,
                    'name' => $record->name,
                    'email' => $record->email,
                    'checkInTime' => $record->check_in_time ? \Carbon\Carbon::parse($record->check_in_time)->format('g:i a') : '—',
                    'status' => $record->check_in_time ? 'attended' : 'absent'
                ];
            });

        return response()->json([
            'event' => $event,
            'totalRegistered' => $totalRegistered,
            'totalAttended' => $totalAttended,
            'manifest' => $manifest
        ]);
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

    // --- STUDENT ENDPOINTS ---

    public function studentDashboard()
    {
        $userId = Auth::id();
        $eventsData = DB::table('events')
            ->where('event_date', '>=', now()->toDateString())
            ->where('status', 'published')
            ->orderBy('event_date', 'asc')
            ->get();

        $formattedEvents = $eventsData->map(function ($event) use ($userId) {
            $registeredCount = DB::table('tickets')
                ->where('event_id', $event->id)
                ->where('status', 'active')
                ->count();
            
            $slotsLeft = $event->total_slots - $registeredCount;

            $userTicket = DB::table('tickets')
                ->where('event_id', $event->id)
                ->where('user_id', $userId)
                ->first();

            $status = 'available';
            if ($userTicket) {
                if ($userTicket->status === 'active') {
                    $status = 'registered';
                } elseif ($userTicket->status === 'waitlisted') {
                    $status = 'waitlisted'; // or custom
                }
            } elseif ($slotsLeft <= 0) {
                $status = 'full';
            } elseif ($slotsLeft <= 15) {
                $status = 'slots_left';
            }

            return [
                'id' => $event->id,
                'title' => $event->title,
                'category' => $event->category,
                'date' => \Carbon\Carbon::parse($event->event_date)->format('D M d, Y \– g:i A'),
                'venue' => $event->venue,
                'totalSlots' => $event->total_slots,
                'registeredCount' => $registeredCount,
                'posterUrl' => null, // TODO: Use poster_path when available
                'status' => $status,
                'slotsLeft' => $slotsLeft > 0 ? $slotsLeft : 0,
            ];
        });

        return response()->json([
            'total' => $formattedEvents->count(),
            'events' => $formattedEvents
        ]);
    }

    public function studentShow($id)
    {
        $userId = Auth::id();
        $event = DB::table('events')->where('id', $id)->first();
        if (!$event) return response()->json(['error' => 'Event not found'], 404);

        $registeredCount = DB::table('tickets')
            ->where('event_id', $event->id)
            ->where('status', 'active')
            ->count();
            
        $slotsLeft = $event->total_slots - $registeredCount;
        
        $userTicket = DB::table('tickets')
            ->where('event_id', $event->id)
            ->where('user_id', $userId)
            ->first();

        $status = 'available';
        if ($userTicket) {
            $status = $userTicket->status === 'active' ? 'registered' : 'waitlisted';
        } elseif ($slotsLeft <= 0) {
            $status = 'full';
        }

        return response()->json([
            'id' => $event->id,
            'title' => $event->title,
            'category' => $event->category,
            'date' => \Carbon\Carbon::parse($event->event_date)->format('D M d, Y \– g:i A'),
            'venue' => $event->venue,
            'description' => $event->description,
            'targetAudience' => $event->target_audience,
            'totalSlots' => $event->total_slots,
            'registeredCount' => $registeredCount,
            'posterUrl' => null,
            'status' => $status,
            'slotsLeft' => $slotsLeft > 0 ? $slotsLeft : 0,
        ]);
    }

    public function feedbackSubmit(Request $request, $event_id)
    {
        // For now, return simple success. In real app, insert into feedback table.
        return response()->json(['success' => true, 'message' => 'Feedback submitted successfully!']);
    }
}