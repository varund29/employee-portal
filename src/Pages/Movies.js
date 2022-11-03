import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import ApiService from "../Services/ApiService";
import Popup from "../components/Popup";

function getNumberOfPages(rowCount, rowsPerPage) {
  return Math.ceil(rowCount / rowsPerPage);
}

function toPages(pages) {
  const results = [];

  for (let i = 1; i < pages; i++) {
    results.push(i);
  }

  return results;
}

const columns = [
  {
    name: "Title",
    selector: (row) => row.title,
    sortable: true,
  },
  {
    name: "Directior",
    selector: (row) => row.director,
    sortable: true,
  },
  {
    name: "Runtime (m)",
    selector: (row) => row.runtime,
    sortable: true,
    right: true,
  },
  {
    button: true,
    cell: (row) => (
      <div className="data-table-re">
        <div className="openbtn text-center">
          <a
            type="button"
            data-bs-toggle="modal"
            data-bs-target={"#model-" + row.id}
          >
            view
          </a>
          <Popup movie={row} />
        </div>
      </div>
    ),
  },
];

// RDT exposes the following internal pagination properties
const BootyPagination = ({
  rowsPerPage,
  rowCount,
  onChangePage,
  onChangeRowsPerPage, // available but not used here
  currentPage,
}) => {
  const handleBackButtonClick = () => {
    onChangePage(currentPage - 1);
  };

  const handleNextButtonClick = () => {
    onChangePage(currentPage + 1);
  };

  const handlePageNumber = (e) => {
    onChangePage(Number(e.target.value));
  };

  const pages = getNumberOfPages(rowCount, rowsPerPage);
  const pageItems = toPages(pages);
  const nextDisabled = currentPage === pageItems.length;
  const previosDisabled = currentPage === 1;

  return (
    <nav>
      <ul className="pagination">
        <li className="page-item">
          <button
            className="page-link"
            onClick={handleBackButtonClick}
            disabled={previosDisabled}
            aria-disabled={previosDisabled}
            aria-label="previous page"
          >
            Previous
          </button>
        </li>
        {pageItems.map((page) => {
          const className =
            page === currentPage ? "page-item active" : "page-item";

          return (
            <li key={page} className={className}>
              <button
                className="page-link"
                onClick={handlePageNumber}
                value={page}
              >
                {page}
              </button>
            </li>
          );
        })}
        <li className="page-item">
          <button
            className="page-link"
            onClick={handleNextButtonClick}
            disabled={nextDisabled}
            aria-disabled={nextDisabled}
            aria-label="next page"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

const BootyCheckbox = React.forwardRef(({ onClick, ...rest }, ref) => (
  <div className="form-check">
    <input
      htmlFor="booty-check"
      type="checkbox"
      className="form-check-input"
      ref={ref}
      onClick={onClick}
      {...rest}
    />
    <label className="form-check-label" id="booty-check" />
  </div>
));

function Movies() {
  const [movies, setData] = useState([]);
  useEffect(() => {
    ApiService.getMovies()
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="container-fluid">
      <h3 className="mt-4 bg-light-theme-txt">Others</h3>

      <DataTable
        columns={columns}
        data={movies}
        defaultSortFieldID={1}
        pagination
        paginationComponent={BootyPagination}
        selectableRows
        selectableRowsComponent={BootyCheckbox}
      />
    </div>
  );
}

export default Movies;
