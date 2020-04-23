import React from 'react';

export default props => (
  <div
    className={`trash game-button${props.trash.length > 0? ' active' : ''}`}
    onClick={() => {
      if (props.trash.length > 0) {
      props.setModalContent([props.trash, 'Trash']);
        props.setShowModal(true);
      };
    }}
  >
    Trash ({props.trash.length})
  </div>
);
