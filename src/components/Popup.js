import React, { useState } from "react";

function onSave(movie) {
  alert(JSON.stringify(movie));
}

function Popup(props) {
  console.log(props.movie);
  let id = "model-" + props.movie.id;
  return (
    <div className="modal" tabIndex="-1" id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Modal title</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>Modal body text goes here.</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSave(props.movie)}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Popup;
