import React from 'react';
import CardDisplay from './CardDisplay';
import Modal from './Modal';

export default props => {
  return <Modal
    close={true}
    show={props.showModal}
    setShow={props.setShowModal}
    children={<CardDisplay altKey={props.altKey} cards={props.modalContent[0]} title={props.modalContent[1]} />}
  />
};
