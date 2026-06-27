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

        // Get events created by this admin
        $eventsQuery = DB::table('events')->where('creator_id', $userId);
        
        // Since we modify the query, let's clone it for total active events
        $totalActiveEvents = (clone $eventsQuery)->where('event_date', '>=', now()->toDateString())->count();
        
        // Let's get total registrations across events created by this admin
        $totalRegistrations = DB::table('tickets')
            ->join('events', 'tickets.event_id', '=', 'events.id')
            ->where('events.creator_id', $userId)
            ->where('tickets.status', 'active')
            ->count();
            
        // Let's get total attendees checked in across events created by this admin
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

        $eventsData = (clone $eventsQuery)
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
                'posterUrl' => $event->poster_path ? asset('storage/' . $event->poster_path) : null,
            ];
        });

        return response()->json([
            'stats' => $stats,
            'events' => $formattedEvents,
        ]);
    }

    public function adminEvents()
    {
        $userId = Auth::id();

        $eventsData = DB::table('events')
            ->where('creator_id', '!=', $userId)
            ->where('status', 'published')
            ->orderBy('event_date', 'asc')
            ->get();

        $formattedEvents = $eventsData->map(function ($event) {
            $registeredCount = DB::table('tickets')
                ->where('event_id', $event->id)
                ->where('status', 'active')
                ->count();
                
            return [
                'id' => $event->id,
                'title' => $event->title,
                'category' => $event->category,
                'description' => $event->description,
                'targetAudience' => $event->target_audience,
                'date' => \Carbon\Carbon::parse($event->event_date)->format('M d, Y'),
                'venue' => $event->venue,
                'totalSlots' => $event->total_slots,
                'registeredCount' => $registeredCount,
                'posterUrl' => $event->poster_path ? asset('storage/' . $event->poster_path) : null,
                'status' => $event->status,
            ];
        });

        return response()->json($formattedEvents);
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
            'poster_path' => $request->hasFile('poster') ? $request->file('poster')->store('posters', 'public') : null,
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

        $dataToUpdate = [
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
        ];

        if ($request->hasFile('poster')) {
            $dataToUpdate['poster_path'] = $request->file('poster')->store('posters', 'public');
        }

        DB::table('events')->where('id', $id)->update($dataToUpdate);

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

    public function exportCertificates(Request $request, $event_id)
    {
        $event = DB::table('events')->where('id', $event_id)->first();
        if (!$event) return response()->json(['error' => 'Event not found'], 404);

        $request->validate([
            'org_head_name' => 'required|string',
            'org_head_signature' => 'required|file|image',
            'tipon_coord_name' => 'required|string',
            'tipon_coord_signature' => 'required|file|image',
            'event_head_name' => 'required|string',
            'event_head_signature' => 'required|file|image',
        ]);

        $attendees = DB::table('tickets')
            ->join('users', 'tickets.user_id', '=', 'users.id')
            ->join('attendances', 'tickets.id', '=', 'attendances.ticket_id')
            ->where('tickets.event_id', $event_id)
            ->where('tickets.status', 'active')
            ->select('users.name')
            ->get();

        if ($attendees->isEmpty()) {
            return response()->json(['error' => 'No attendees found for this event'], 404);
        }

        $templatePath = storage_path('app/public/templates/cert_template.png');
        if (!file_exists($templatePath)) {
            return response()->json(['error' => 'Certificate template not found'], 500);
        }

        $fontPath = storage_path('app/fonts/PinyonScript-Regular.ttf');
        $nameFontPath = storage_path('app/fonts/Roboto-Regular.ttf');
        if (!file_exists($fontPath) || !file_exists($nameFontPath)) {
            return response()->json(['error' => 'Font not found'], 500);
        }

        // Process signatures
        $loadSignature = function ($file) {
            $data = file_get_contents($file->getRealPath());
            $img = imagecreatefromstring($data);
            
            // Convert any transparency or weird formats to true color with alpha
            if ($img) {
                imagealphablending($img, true);
                imagesavealpha($img, true);
            }
            return $img;
        };

        $orgSig = $loadSignature($request->file('org_head_signature'));
        $tiponSig = $loadSignature($request->file('tipon_coord_signature'));
        $eventSig = $loadSignature($request->file('event_head_signature'));

        $zipFile = storage_path("app/public/certificates_{$event_id}.zip");
        $zip = new \ZipArchive();
        if ($zip->open($zipFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['error' => 'Failed to create zip file'], 500);
        }

        foreach ($attendees as $index => $attendee) {
            $image = imagecreatefrompng($templatePath);
            imagealphablending($image, true);
            imagesavealpha($image, true);

            $primaryColor = imagecolorallocate($image, 232, 78, 27); // #e84e1b (Template orange)
            
            $imageWidth = imagesx($image);
            $imageHeight = imagesy($image);

            // 1. Draw Student Name (Cursive)
            $fontSize = 130; // Slightly larger for better emphasis
            $text = $attendee->name;
            $bbox = imagettfbbox($fontSize, 0, $fontPath, $text);
            $textWidth = $bbox[2] - $bbox[0];
            $textHeight = $bbox[1] - $bbox[7];
            $x = ($imageWidth - $textWidth) / 2;
            $nameY = ($imageHeight / 2) + 85; // Adjusted down to sit on the horizontal line
            imagettftext($image, $fontSize, 0, $x, $nameY, $primaryColor, $fontPath, $text);

            // 2. Draw paragraph with event name
            $paragraph = "This certificate recognizes the recipient's participation, commitment, and contribution to the {$event->title}. May this achievement inspire continued involvement in activities that promote leadership, collaboration, and excellence within the academic community.";
            $pFontSize = 26; // Adjusted for better readability
            
            $words = explode(' ', $paragraph);
            $lines = [];
            $currentLine = '';
            $maxWidth = $imageWidth * 0.75; // 75% max width for the paragraph

            foreach ($words as $word) {
                $testLine = $currentLine . ' ' . $word;
                $bbox = imagettfbbox($pFontSize, 0, $nameFontPath, trim($testLine));
                $testWidth = $bbox[2] - $bbox[0];
                
                if ($testWidth > $maxWidth && !empty($currentLine)) {
                    $lines[] = trim($currentLine);
                    $currentLine = $word;
                } else {
                    $currentLine = $testLine;
                }
            }
            if (!empty($currentLine)) {
                $lines[] = trim($currentLine);
            }

            $pY = $nameY + 80; // Start comfortably below the horizontal line
            $lineHeight = 45;
            foreach ($lines as $line) {
                $bbox = imagettfbbox($pFontSize, 0, $nameFontPath, $line);
                $lineWidth = $bbox[2] - $bbox[0];
                $lineX = ($imageWidth - $lineWidth) / 2;
                imagettftext($image, $pFontSize, 0, $lineX, $pY, $primaryColor, $nameFontPath, $line);
                $pY += $lineHeight;
            }

            $drawSignature = function ($img, $sigImg, $name, $centerX) use ($imageHeight, $nameFontPath, $primaryColor) {
                if ($sigImg) {
                    $sigW = imagesx($sigImg);
                    $sigH = imagesy($sigImg);
                    // Target width 220px for signatures
                    $targetW = 220;
                    $targetH = ($sigH / $sigW) * $targetW;
                    
                    // Place signature dynamically above the typed name
                    $sigY = ($imageHeight - 220) - $targetH;
                    $sigX = $centerX - ($targetW / 2);
                    imagecopyresampled($img, $sigImg, $sigX, $sigY, 0, 0, $targetW, $targetH, $sigW, $sigH);
                }

                // Draw name directly below the signature, resting on the template line
                $nameSize = 22;
                $bbox = imagettfbbox($nameSize, 0, $nameFontPath, $name);
                $nameW = $bbox[2] - $bbox[0];
                $nameX = $centerX - ($nameW / 2);
                $nameY = $imageHeight - 195; // Adjusted to sit above the title text
                imagettftext($img, $nameSize, 0, $nameX, $nameY, $primaryColor, $nameFontPath, $name);
            };

            // Centers align with the three underline slots at the bottom of the template
            $leftCenter = $imageWidth * 0.22;
            $midCenter = $imageWidth * 0.50;
            $rightCenter = $imageWidth * 0.78;

            $drawSignature($image, $orgSig, $request->org_head_name, $leftCenter);
            $drawSignature($image, $tiponSig, $request->tipon_coord_name, $midCenter);
            $drawSignature($image, $eventSig, $request->event_head_name, $rightCenter);
            
            ob_start();
            imagepng($image);
            $imageData = ob_get_clean();
            imagedestroy($image);
            
            $safeName = preg_replace('/[^a-zA-Z0-9]/', '_', $attendee->name);
            $filename = "certificate_{$safeName}.png";
            $zip->addFromString($filename, $imageData);
        }
        $zip->close();
        
        if ($orgSig) imagedestroy($orgSig);
        if ($tiponSig) imagedestroy($tiponSig);
        if ($eventSig) imagedestroy($eventSig);

        return response()->download($zipFile)->deleteFileAfterSend(true);
    }

    public function exportCSV($event_id)
    {
        $manifest = DB::table('tickets')
            ->join('users', 'tickets.user_id', '=', 'users.id')
            ->leftJoin('attendances', 'tickets.id', '=', 'attendances.ticket_id')
            ->where('tickets.event_id', $event_id)
            ->where('tickets.status', 'active')
            ->select('users.name', 'users.email', 'attendances.check_in_time')
            ->get();

        $filename = "event_{$event_id}_manifest.csv";
        $handle = fopen('php://temp', 'w+');
        fputcsv($handle, ['#', 'STUDENT NAME', 'UNIVERSITY EMAIL', 'CHECK-IN TIME', 'STATUS']);

        foreach ($manifest as $index => $row) {
            $status = $row->check_in_time ? 'Attended' : 'Absent';
            $checkIn = $row->check_in_time ? \Carbon\Carbon::parse($row->check_in_time)->format('g:i a') : '-';
            fputcsv($handle, [$index + 1, $row->name, $row->email, $checkIn, $status]);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"");
    }

    public function exportExcel($event_id)
    {
        $manifest = DB::table('tickets')
            ->join('users', 'tickets.user_id', '=', 'users.id')
            ->leftJoin('attendances', 'tickets.id', '=', 'attendances.ticket_id')
            ->where('tickets.event_id', $event_id)
            ->where('tickets.status', 'active')
            ->select('users.name', 'users.email', 'attendances.check_in_time')
            ->get();

        $filename = "event_{$event_id}_manifest.xls";
        $html = '<table border="1"><tr><th>#</th><th>STUDENT NAME</th><th>UNIVERSITY EMAIL</th><th>CHECK-IN TIME</th><th>STATUS</th></tr>';

        foreach ($manifest as $index => $row) {
            $status = $row->check_in_time ? 'Attended' : 'Absent';
            $checkIn = $row->check_in_time ? \Carbon\Carbon::parse($row->check_in_time)->format('g:i a') : '-';
            $num = $index + 1;
            $html .= "<tr><td>{$num}</td><td>{$row->name}</td><td>{$row->email}</td><td>{$checkIn}</td><td>{$status}</td></tr>";
        }
        $html .= '</table>';

        return response($html)
            ->header('Content-Type', 'application/vnd.ms-excel')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"");
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
            $ticketCode = null;
            if ($userTicket) {
                if ($userTicket->status === 'active') {
                    $status = 'registered';
                    $ticketCode = 'TK - ' . str_pad($userTicket->id, 3, '0', STR_PAD_LEFT);
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
                'posterUrl' => $event->poster_path ? asset('storage/' . $event->poster_path) : null,
                'status' => $status,
                'slotsLeft' => $slotsLeft > 0 ? $slotsLeft : 0,
                'ticketCode' => $ticketCode,
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
            'posterUrl' => $event->poster_path ? asset('storage/' . $event->poster_path) : null,
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