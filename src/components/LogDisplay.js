import React from 'react';
import { useEffect } from 'react';

export default props => {
  const logSticker = document.getElementById('log-sticker');

  useEffect(() => {
    if (logSticker) logSticker.scrollIntoView();
  }, [props.logs, logSticker]);

  return (
    <div className="logs">
      <p className="log-title">Log</p>
      <div className="breakline"/>
      <div className="log-readout">
        {props.logs.length >1? props.logs : <div className="spacer"/>}
        <div id="log-sticker" />
      </div>
    </div>
  );
};
