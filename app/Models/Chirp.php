<?php

namespace App\Models;
use App\Events\ChirpCreated;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Chirp extends Model
{
    protected $fillable = [
        'message',
        'media_path',
    ];
    protected $dispatchesEvents = [
        'created' => ChirpCreated::class,
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);

    }

}

