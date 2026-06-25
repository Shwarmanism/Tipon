<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// API Authentication Endpoints
Route::post('/login', [AuthController::class, 'loginSubmit']);
Route::post('/register', [AuthController::class, 'registerSubmit']);

use App\Http\Controllers\EventController;
use App\Http\Controllers\AttendanceController;

Route::middleware('auth:sanctum')->group(function () {
    /* Role B: Admin (Organization Officer) */
    Route::group(['prefix' => 'admin'], function () {
        // Dashboard Analytics
        Route::get('/dashboard', [EventController::class, 'dashboard']);

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