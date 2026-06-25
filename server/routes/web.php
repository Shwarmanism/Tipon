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



/*Fallback Route*/
Route::fallback([FallbackController::class, 'endpoint']);