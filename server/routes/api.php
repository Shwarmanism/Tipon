<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// API Authentication Endpoints
Route::post('/login', [AuthController::class, 'loginSubmit']);
Route::post('/register', [AuthController::class, 'registerSubmit']);

use App\Http\Controllers\EventController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\TicketController;

Route::middleware('auth:sanctum')->group(function () {
    /* Role A: Normal User (Student / Attendee) */
    Route::group(['prefix' => 'user'], function () {
        Route::get('/dashboard', [EventController::class, 'studentDashboard']);
        Route::get('/event/{id}', [EventController::class, 'studentShow']);
        Route::get('/tickets', [TicketController::class, 'list']);
        Route::get('/ticket/{id}', [TicketController::class, 'showQR']);
        Route::post('/register/{event_id}', [TicketController::class, 'store']);
        Route::post('/cancel/{id}', [TicketController::class, 'cancel']);
        Route::post('/feedback/{event_id}', [EventController::class, 'feedbackSubmit']);
        
        // Profile Endpoints
        Route::get('/profile', [AuthController::class, 'getProfile']);
        Route::post('/profile/update', [AuthController::class, 'updateProfile']);
        Route::put('/profile/password', [AuthController::class, 'updatePassword']);
    });

    /* Role B: Admin (Organization Officer) */
    Route::group(['prefix' => 'admin'], function () {
        // Dashboard Analytics
        Route::get('/dashboard', [EventController::class, 'dashboard']);

        // Profile Endpoints
        Route::get('/profile', [AuthController::class, 'getProfile']);
        Route::post('/profile/update', [AuthController::class, 'updateProfile']);
        Route::put('/profile/password', [AuthController::class, 'updatePassword']);

        // Event Lifecycle Management
        Route::get('/event/add', [EventController::class, 'createForm']);
        Route::post('/event/submit', [EventController::class, 'store']);
        Route::get('/event/edit/{id}', [EventController::class, 'editEvent']);
        Route::put('/event/update/{id}', [EventController::class, 'updateSubmit']);
        Route::delete('/event/delete/{id}', [EventController::class, 'delete']);

        // Ticketing & Attendance Check-in 
        Route::get('/checkin/{event_id}', [AttendanceController::class, 'scannerPage']);
        Route::post('/checkin/scan', [AttendanceController::class, 'scanQrCode']); 
        Route::post('/checkin/manual', [AttendanceController::class, 'manualCheckIn']);

        // Comprehensive Event Reports 
        Route::get('/report/{event_id}', [EventController::class, 'reportYield']); 
        Route::get('/export/{event_id}', [EventController::class, 'exportManifest']);
        
        // E-Certificates
        Route::get('/certificates/send/{event_id}', [EventController::class, 'issueCertificates']);
    });
});