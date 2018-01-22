// connect to server
var socket = io.connect();

// when connected
socket.on( 'connect', function(msg) {
  document.getElementById( "connectId" ).innerHTML = "your ID::" + socket.id;
});

// when receive a message
socket.on( 'message', function(msg) {
  document.getElementById( "receiveMsg" ).appendChild( document.createTextNode( msg  ) );
  document.getElementById( "receiveMsg" ).appendChild( document.createElement( "br" ) );
});


window.addEventListener( 'load', function() {
  // message sending
  document.getElementById( 'send' ).addEventListener( 'click', function() {
    var msg = document.getElementById( 'message' ).value;
    console.log( msg );
    socket.emit( 'message', msg );
  });

  // disconect
  document.getElementById( 'disconnect' ).addEventListener( 'click', function() {
    socket.send(socket.id + " has been disconected.");
    socket.disconnect();
    document.getElementById( "connectId" ).innerHTML = "Disconnected";
  });
});
