
import React from 'react';

const ToastUndo = (props) => {
  let icon = 'icon';
  if (props.showType == 'e') {
    icon += ' icon-error-icons';
  } else if (props.showType == 's') {
     icon += ' icon-accept-approve1-ie';      
  } else if (props.showType == 'w') {
    icon += ' icon-accept-warning2-ie';
  } else if (props.showType == 'i') {
    icon += ' icon-info';
  }



  let data = props.message != null && typeof (props.message) == 'string' && props.message != '' ? props.message.split('.,').join('.\n').split('\n').map((text, index) => (
    <React.Fragment key={`${text}-${index}`}>
      {text}
      <br />
    </React.Fragment>
  )) : props.message;

  let msgdata = (<p>{data}</p>);
  return (
    <div className="Toastify_content__">
      <h3>
        {msgdata}
        <i className={icon}></i>
      </h3>
    </div>
  );
}
ToastUndo.defaultProps = {
  message: '',
  showType: 'e'
};

export { ToastUndo };


