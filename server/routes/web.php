<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\FallbackController;


Route::get('/', [EventController::class, 'index'])->name('welcome');
Route::get('/event/{id}', [EventController::class, 'show'])->name('event.show');

Route::get('/login', [AuthController::class, 'loginForm'])->name('login');
Route::post('/login', [AuthController::class, 'loginSubmit'])->name('login.submit');

Route::get('/register', [AuthController::class, 'registerForm'])->name('register');
Route::post('/register', [AuthController::class, 'registerSubmit'])->name('register.submit');
Route::get('/logout', [AuthController::class, 'logout'])->name('logout');

/* Role A: Normal User (Student / Attendee) */
Route::group(['prefix' => 'student'], function () {


    // Ticket Wallet & QR Access
    Route::get('/tickets', [TicketController::class, 'list'])->name('student.tickets');
    Route::get('/ticket/{id}', [TicketController::class, 'showQR'])->name('student.ticket.view');
    
    // Registration & Slot Management
    Route::post('/register/{event_id}', [TicketController::class, 'store'])->name('student.register');
    
    // Cancellation (Also triggers automatic waitlist allocation)
    Route::get('/cancel/{id}', [TicketController::class, 'cancel'])->name('student.cancel');
    
    // Post-Event Evaluation form (Value-Add Feature)
    Route::get('/feedback/{event_id}', [EventController::class, 'feedbackForm'])->name('student.feedback');
    Route::post('/feedback/submit', [EventController::class, 'feedbackSubmit'])->name('student.feedback.submit');
});

 /* Role B: Admin (Organization Officer) */
Route::group(['prefix' => 'admin'], function () {

    // Dashboard Analytics (Active events, real-time capacity)
    Route::get('/dashboard', [EventController::class, 'dashboard'])->name('admin.dashboard');

    // Event Lifecycle Management (Full CRUD)
    Route::get('/event/add', [EventController::class, 'createForm'])->name('admin.event.add');
    Route::post('/event/submit', [EventController::class, 'store'])->name('admin.event.store');
    
    Route::get('/event/edit/{id}', [EventController::class, 'editEvent'])->name('admin.event.edit');
    Route::put('/event/update/{id}', [EventController::class, 'updateSubmit'])->name('admin.event.update');
    
    // Deleting an event (Using GET method as taught in your class)
    Route::get('/event/delete/{id}', [EventController::class, 'delete'])->name('admin.event.delete');

    // Ticketing & Attendance Check-in 
    Route::get('/checkin/{event_id}', [AttendanceController::class, 'scannerPage'])->name('admin.scanner');
    Route::post('/checkin/scan', [AttendanceController::class, 'scanQrCode'])->name('admin.scan.submit'); 
    Route::post('/checkin/manual', [AttendanceController::class, 'manualCheckIn'])->name('admin.manual.submit');

    // Comprehensive Event Reports 
    Route::get('/report/{event_id}', [EventController::class, 'reportYield'])->name('admin.report'); 
    Route::get('/export/{event_id}', [EventController::class, 'exportManifest'])->name('admin.export');
    
    // E-Certificates (Value-Add Feature)
    Route::get('/certificates/send/{event_id}', [EventController::class, 'issueCertificates'])->name('admin.certificates.send');
});

/*Fallback Route*/
Route::fallback([FallbackController::class, 'endpoint']);