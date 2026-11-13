// Shared by the <head> script (server) and the "Redraw this page" button (client).
export const REDRAW_KEY = "impeccable:redraw";
export const REDRAW_CLASS = "page-redraw";

/** Runs in <head> before the page paints. Clears the flag so a later reload is normal. */
export const redrawScript = `try{if(sessionStorage.getItem("${REDRAW_KEY}")){sessionStorage.removeItem("${REDRAW_KEY}");var d=document.documentElement;d.classList.add("${REDRAW_CLASS}");setTimeout(function(){d.classList.remove("${REDRAW_CLASS}")},4000)}}catch(e){}`;
