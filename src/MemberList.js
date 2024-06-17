import React, { useState, useEffect } from 'react';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingRow, setEditingRow] = useState(null);

 
  useEffect(() => {
    const apiUrl = 'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json';
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setMembers(data);
        setFilteredMembers(data);
      })
      .catch((error) => {
        console.error('Error fetching members from api:', error);
      });
  }, []);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = members.filter(
      (member) =>
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.role.toLowerCase().includes(term)
    );
    setFilteredMembers(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const capitalizeFirstLetter = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(id)) {
        return prevSelectedRows.filter((rowId) => rowId !== id);
      } else {
        return [...prevSelectedRows, id];
      }
    });
  };

  const handleEditRow = (id) => {
    setEditingRow(id);
  };

  const handleSaveButon = (id, updatedMember) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === id ? { ...member, ...updatedMember } : member
      )
    );
    setFilteredMembers((prevFilteredMembers) =>
      prevFilteredMembers.map((member) =>
        member.id === id ? { ...member, ...updatedMember } : member
      )
    );
    setEditingRow(null);
  };

  const handleDeleteButton = (id) => {
    setMembers((prevMembers) => prevMembers.filter((member) => member.id !== id));
    setFilteredMembers((prevFilteredMembers) =>
      prevFilteredMembers.filter((member) => member.id !== id)
    );
  };

  const handleDeleteSelected = () => {
    setMembers((prevMembers) =>
      prevMembers.filter((member) => !selectedRows.includes(member.id))
    );
    setFilteredMembers((prevFilteredMembers) =>
      prevFilteredMembers.filter((member) => !selectedRows.includes(member.id))
    );
    setSelectedRows([]);
  };

  const handleSelectAllOption = (event) => {
    const isChecked = event.target.checked;
    const selectedIds = isChecked
      ? filteredMembers
          .slice((currentPage - 1) * 10, currentPage * 10)
          .map((member) => member.id)
      : [];
    setSelectedRows(selectedIds);
  };

  const renderMemberRow = (member) => {
    const isSelected = selectedRows.includes(member.id);
    const isEditing = editingRow === member.id;
    

    return (
      <tr key={member.id} style={{ backgroundColor: isSelected ? '#f0f0f0' : 'inherit' }}>
        <td>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleRowSelect(member.id)}
          />
        </td>
        <td>{isEditing ? <input defaultValue={member.name} onBlur={(e) => handleSaveButon(member.id, { name: e.target.value })} /> : member.name}</td>
        <td>{isEditing ? <input defaultValue={member.email} onBlur={(e) => handleSaveButon(member.id, { email: e.target.value })} /> : member.email}</td>
        <td>{isEditing ? <input defaultValue={capitalizeFirstLetter(member.role)} onBlur={(e) => handleSaveButon(member.id, capitalizeFirstLetter({ role: e.target.value }) )} /> : capitalizeFirstLetter(member.role)}</td>
        <td>
          {isEditing ? (
            <button className="save" onClick={() => setEditingRow(null)}>
              Save
            </button>
          ) : (
            <>
              <button className="edit" onClick={() => handleEditRow(member.id)}>Edit</button>
              <button className="delete" onClick={() => handleDeleteButton(member.id)}>Delete</button>
            </>
          )}
        </td>
      </tr>
    );
  };

  const renderPaginationControls = () => {
    const totalPages = Math.ceil(filteredMembers.length / 10);
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={i === currentPage}
          style={{
            fontWeight: i === currentPage ? 'bold' : 'normal',
          }}
        >
          {i}
        </button>
      );
    }

    return (
      <div>
        <button
          className="first-page"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </button>
        <button
          className="previous-page"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {pageNumbers}
        <button
          className="next-page"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button
          className="last-page"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      </div>
    );
  };

  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const displayedMembers = filteredMembers.slice(startIndex, endIndex);

  return (
    <div className='member-list-container'>
      <div className='search container'>
      <input
        type="text"
        placeholder="Search by name, email or role"
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      <table className='member-table'>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  selectedRows.length === displayedMembers.length &&
                  displayedMembers.length > 0
                }
                onChange={handleSelectAllOption}
              />
            </th>
            <th className='table-header'>Name</th>
            <th className='table-header'>Email</th>
            <th className='table-header'>Role</th>
            <th className='table-header'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedMembers.map(renderMemberRow)}
        </tbody>
      </table>
        <div className='pagination-container'>
        {renderPaginationControls()}
        </div>
      <button className="del-btn" onClick={handleDeleteSelected}>Delete Selected</button>
      </div>
    </div>
  );
};

export default MemberList;