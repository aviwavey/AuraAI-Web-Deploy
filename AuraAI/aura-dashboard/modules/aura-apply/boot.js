// A source-file preview is not the application server. Keep its fallback styled
// and useful, and never attempt API requests against file://.
if(location.protocol==='file:'){
  document.querySelector('#run-status').textContent='Server required';
  document.querySelector('#heading').textContent='Open the running app';
  document.querySelector('#refresh').disabled=true;
}else{
  const script=document.createElement('script');
  script.src=new URL('./app.js',location.href).href;
  script.onerror=()=>{
    document.querySelector('#run-status').textContent='Connection problem';
    document.querySelector('#content').textContent='The application could not load. Check that the server is running, then reload this page.';
  };
  const preferences=document.createElement('script');
  preferences.src=new URL('./preferences.js',location.href).href;
  preferences.onload=()=>document.head.append(script);
  preferences.onerror=script.onerror;
  document.head.append(preferences);
}
