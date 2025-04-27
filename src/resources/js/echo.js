import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

 window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'qqmsdqbnqvuhmij41258',
    wsHost: window.location.hostname || 'reverb',
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8081,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8081,
    forceTLS: false,
   // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    cluster: 'mt1' // Adicione esta linha
}); 


/*  window.Echo = new Echo({
                broadcaster: 'reverb',
                key: '{{ env('REVERB_APP_KEY') }}',
                wsHost: window.location.hostname,
                wsPort: 8081,
                forceTLS: false,
                disableStats: true,
                enabledTransports: ['ws', 'wss'],
                cluster: 'mt1' // Adicione esta linha
            }); */


/* window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'qqmsdqbnqvuhmij41258',
    wsHost: window.location.hostname,
    wsPort: 8081,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
}); */


