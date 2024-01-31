import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";

interface Data {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Table: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [filteredData, setFilteredData] = useState<Data[]>([]);

  const [search, setSearch] = useState<string>("");
  const [editId, setEditId] = useState<string>("");
  const [editData, setEditData] = useState<Data[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [checkedBox, setCheckedBox] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(true);
  const [isCheakedHeading, setIsCheckedHeading] = useState(false);

  const rowPerPage = 10;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://excelerate-profile-dev.s3.ap-south-1.amazonaws.com/1681980949109_users.json"
        );
        if (!response.ok) {
          console.log("response was not ok");
        }

        const result: Data[] = await response.json();
        setData(result);
        setFilteredData(result);
      } catch (err) {
        console.log("error while fetching the data");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }
    const filterData = data.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredData(filterData);
  }, [search, data]);

  if (!data || data.length === 0) {
    return <p>No data found.</p>;
  }

  //handle next page
  const handleNextPage = (currentPage: number) => {
    let num = Math.ceil(filteredData.length / rowPerPage) - 1;
    if (currentPage < num) {
      setCurrentPage(currentPage + 1);
    } else {
      setCurrentPage(0);
    }
  };

  //handle previous page
  const handlePreviousPage = (currentPage: number) => {
    let num = Math.ceil(filteredData.length / rowPerPage) - 1;
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      setCurrentPage(num);
    }
  };

  //handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  //handle one delete item
  const handleOneDeleteItem = (id: string) => {
    if (checkedBox.includes(id)) {
      let result = filteredData.filter((item) => item.id !== id);
      let newArray = checkedBox.filter((itemId) => itemId !== id);
      setCheckedBox(newArray);

      setFilteredData(result);
    } else {
      return;
    }
  };

  //handle checked box

  const handleSingleChecked = (id: string) => {
    setIsChecked(!isChecked);
    if (checkedBox.includes(id)) {
      let newArray = checkedBox.filter((itemId) => itemId !== id);
      setCheckedBox(newArray);
    } else {
      setCheckedBox([...checkedBox, id]);
    }
  };

  //handle heading select all check box

  const handleIsCheckedHeading = () => {
    if (isCheakedHeading) {
      setCheckedBox([]);
    } else {
      const currentPageData = filteredData.slice(
        currentPage * rowPerPage,
        (currentPage + 1) * rowPerPage
      );
      let currentPageIds = currentPageData.map((item) => item.id);
      setCheckedBox(currentPageIds);
    }

    setIsCheckedHeading(!isCheakedHeading);
  };

  //handle delete all

  const handleDeleteAll = () => {
    if (isCheakedHeading) {
      let lastPage = Math.ceil(filteredData.length / rowPerPage);
      const currentData = filteredData.slice(
        (currentPage + 1) * rowPerPage,
        lastPage * rowPerPage
      );
      setFilteredData(currentData);
    }
    setIsCheckedHeading(!isCheakedHeading);
  };

  //handle editing

  const handleEditClick = (id: string) => {
    let editedData = data.find((item) => item.id === id);

    setEditData(editedData);

    if (editedData) {
      setEditId(editedData.id);
    }
  };

  const handleUpdateOneItem = (id: string) => {
    let index = data.findIndex((item) => {
      return id === item.id;
    });

    let newData = [...filteredData];
    if (editData !== undefined) {
      newData[index]["name"] = editData?.name;
      newData[index]["email"] = editData?.email;
      newData[index]["role"] = editData?.role;
    }

    setFilteredData(newData);

    setEditId("");
  };

  const firstTenData = filteredData.slice(
    currentPage * rowPerPage,
    (currentPage + 1) * rowPerPage
  );

  const handlePageClick = (currentPage: number) => {
    setCurrentPage(currentPage);
  };

  //for pagination;
  let pages: number[] = [];

  for (let i = 0; i < Math.ceil(data.length / rowPerPage); i++) {
    pages.push(i);
  }

  return (
    <div className="container justify-content-center align-items-center ">
      <div className="container mt-5  d-flex justify-content-center">
        <div className="row">
          <div className="col-lg-12">
            <input
              type="text"
              className="input-group-text form-control  "
              placeholder="Search Here"
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
      <div className="container">
        <table className="table table-hover table-striped ">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  style={{ cursor: "pointer" }}
                  checked={isCheakedHeading}
                  onChange={handleIsCheckedHeading}
                />
              </th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {firstTenData.map((item) => (
              <tr key={item.id}>
                {item.id === editId ? (
                  <>
                    <td>
                      <input type="checkbox" style={{ cursor: "pointer" }} />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="name"
                        onChange={(e) =>
                          setEditData((prevData) => ({
                            ...prevData,
                            name: e.target.value,
                          }))
                        }
                        value={editData?.name}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="email"
                        onChange={(e) =>
                          setEditData((prevData) => ({
                            ...prevData,
                            email: e.target.value,
                          }))
                        }
                        value={editData?.email}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="role"
                        onChange={(e) =>
                          setEditData((prevData) => ({
                            ...prevData,
                            role: e.target.value,
                          }))
                        }
                        value={editData?.role}
                      />
                    </td>
                    <td>
                      <button
                        onClick={(e) => handleUpdateOneItem(item.id)}
                        style={{ backgroundColor: "skyblue" }}
                      >
                        Save
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <input
                        type="checkbox"
                        name="checkbox"
                        checked={checkedBox.includes(item.id)}
                        onChange={() => {
                          handleSingleChecked(item.id);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td>
                      <FontAwesomeIcon
                        icon={faPencilAlt}
                        size="lg"
                        color="blue"
                        cursor="pointer"
                        style={{ marginRight: "2vw" }}
                        onClick={() => handleEditClick(item.id)}
                      />

                      <FontAwesomeIcon
                        icon={faTrash}
                        size="lg"
                        color="red"
                        cursor="pointer"
                        onClick={() => handleOneDeleteItem(item.id)}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-center">
        <nav aria-label="...">
          <ul className="pagination">
            <li className="page-item " onClick={() => setCurrentPage(0)}>
              <a className="page-link" href="#/">
                {"<<"}
              </a>
            </li>
            <li
              className="page-item"
              onClick={() => handlePreviousPage(currentPage)}
            >
              <a className="page-link" href="#/">
                Previous
              </a>
            </li>
            {/* mapping the page numbers */}
            {pages.map((page) => (
              <li
                className={`page-item  ${currentPage === page ? "active" : ""}`}
                key={page}
                onClick={() => handlePageClick(page)}
              >
                <a className="page-link" href="#/">
                  {page + 1}
                </a>
              </li>
            ))}
            <li
              className="page-item"
              onClick={() => handleNextPage(currentPage)}
            >
              <a className="page-link" href="#/">
                Next
              </a>
            </li>
            <li
              className="page-item"
              onClick={() =>
                setCurrentPage(Math.ceil(filteredData.length / rowPerPage) - 1)
              }
            >
              <a className="page-link" href="#/">
                {">>"}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="d-flex justify-content-center">
        <button className="btn btn-danger mx-1" onClick={handleDeleteAll}>
          Delete All
        </button>
      </div>
    </div>
  );
};

export default Table;
