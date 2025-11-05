import React, { useState, useEffect } from 'react';
import { X, Upload, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const JoiningForm = () => {
  const [showJoiningModal, setShowJoiningModal] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enquiryData, setEnquiryData] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCandidateList, setShowCandidateList] = useState(true);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const [joiningFormData, setJoiningFormData] = useState({
    joiningId: '',
    nameAsPerAadhar: '',
    fatherName: '',
    dateOfJoining: '',
    joiningPlace: '',
    designation: '',
    salary: '',
    aadharFrontPhoto: null,
    aadharBackPhoto: null,
    panCardNumber: '',
    candidatePhoto: null,
    currentAddress: '',
    addressAsPerAadhar: '',
    dobAsPerAadhar: '',
    gender: '',
    mobileNo: '',
    familyMobileNo: '',
    relationshipWithFamily: '',
    pastPfId: '',
    currentBankAc: '',
    ifscCode: '',
    branchName: '',
    bankPassbookPhoto: null,
    personalEmail: '',
    esicNo: '',
    highestQualification: '',
    pfEligible: '',
    esicEligible: '',
    joiningCompanyName: '',
    emailToBeIssue: '',
    issueMobile: '',
    issueLaptop: '',
    aadharCardNo: '',
    modeOfAttendance: '',
    qualificationPhoto: null,
    paymentMode: '',
    salarySlip: null,
    resumeCopy: null,
    department: '',
    equipment: ''
  });

  // Fetch ENQUIRY data
const fetchEnquiryData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwZ96aXBp4sNGMzHjLf1iq98Pj1u6agtAb02Qv2KvdYYf7bzqrXAxWRxJ2LJIXVyN453g/exec?sheet=ENQUIRY&action=fetch"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data || result.data.length < 7) {
        throw new Error(result.error || "Not enough rows in enquiry sheet data");
      }

      // Process enquiry data
      const enquiryHeaders = result.data[5].map((h) => h.trim());
      const enquiryDataFromRow7 = result.data.slice(6);

      const getIndex = (headerName) =>
        enquiryHeaders.findIndex((h) => h === headerName);

      const departmentIndex = getIndex("Department");
      const columnAAIndex = 26; // Column AA is index 26
      const columnABIndex = 27; // Column AB is index 27

      const processedEnquiryData = enquiryDataFromRow7
        .map((row) => ({
          id: row[getIndex("Timestamp")],
          indentNo: row[getIndex("Indent Number")],
          candidateEnquiryNo: row[getIndex("Candidate Enquiry Number")],
          applyingForPost: row[getIndex("Applying For the Post")],
          department: row[departmentIndex] || "",
          candidateName: row[getIndex("Candidate Name")],
          candidateDOB: row[getIndex("DOB")],
          candidatePhone: row[getIndex("Candidate Phone Number")],
          candidateEmail: row[getIndex("Candidate Email")],
          previousCompany: row[getIndex("Previous Company Name")],
          jobExperience: row[getIndex("Job Experience")] || "",
          lastSalary: row[getIndex("Last Salary Drawn")] || "",
          previousPosition: row[getIndex("Previous Position")] || "",
          reasonForLeaving: row[getIndex("Reason Of Leaving Previous Company")] || "",
          maritalStatus: row[getIndex("Marital Status")] || "",
          lastEmployerMobile: row[getIndex("Last Employer Mobile Number")] || "",
          candidatePhoto: row[getIndex("Candidate Photo")] || "",
          candidateResume: row[19] || "",
          referenceBy: row[getIndex("Reference By")] || "",
          presentAddress: row[getIndex("Present Address")] || "",
          aadharNo: row[getIndex("Aadhar Number")] || "",
          designation: row[getIndex("Applying For the Post")] || "",
          columnAA: row[columnAAIndex] || "", // Column AA value
          columnAB: row[columnABIndex] || "", // Column AB value
        }))
        // Filter for records where Column AA is not null and Column AB is null
        .filter(candidate => candidate.columnAA && !candidate.columnAB);

      setEnquiryData(processedEnquiryData);
      
      // Check if URL has enquiry parameter and auto-select candidate
      const urlParams = new URLSearchParams(window.location.search);
      const enquiryParam = urlParams.get('enquiry');
      
      if (enquiryParam) {
        const candidateFromURL = processedEnquiryData.find(
          candidate => candidate.candidateEnquiryNo === enquiryParam
        );
        
        if (candidateFromURL) {
          handleCandidateSelect(candidateFromURL);
        }
      }
    } catch (error) {
      console.error("Error fetching enquiry data:", error);
      toast.error("Failed to fetch candidate data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiryData();
  }, []);

  useEffect(() => {
    fetchEnquiryData();
  }, []);

  const formatDOB = (dateString) => {
    if (!dateString) return '';
    
    let date;
    
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        if (parseInt(parts[0]) > 12) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          date = new Date(parts[2], parts[0] - 1, parts[1]);
        }
      }
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${year}-${month}-${day}`;
  };

  // Handle candidate selection and prefill data
  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    setJoiningFormData(prev => ({
      ...prev,
      nameAsPerAadhar: candidate.candidateName || '',
      designation: candidate.designation || candidate.applyingForPost || '',
      currentAddress: candidate.presentAddress || '',
      dobAsPerAadhar: formatDOB(candidate.candidateDOB) || '',
      mobileNo: candidate.candidatePhone || '',
      personalEmail: candidate.candidateEmail || '',
      aadharCardNo: candidate.aadharNo || '',
      department: candidate.department || '',
    }));
    setShowCandidateList(false);
  };

  const handleJoiningInputChange = (e) => {
    const { name, value } = e.target;
    setJoiningFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setJoiningFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const postToJoiningSheet = async (rowData) => {
    const URL = 'https://script.google.com/macros/s/AKfycbwZ96aXBp4sNGMzHjLf1iq98Pj1u6agtAb02Qv2KvdYYf7bzqrXAxWRxJ2LJIXVyN453g/exec';

    try {
      console.log('Attempting to post:', {
        sheetName: 'JOINING',
        rowData: rowData
      });

      const params = new URLSearchParams();
      params.append('sheetName', 'JOINING');
      params.append('action', 'insert');
      params.append('rowData', JSON.stringify(rowData));

      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Server returned unsuccessful response');
      }

      return data;
    } catch (error) {
      console.error('Full error details:', {
        error: error.message,
        stack: error.stack,
        rowData: rowData,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Failed to update sheet: ${error.message}`);
    }
  };

  const uploadFileToDrive = async (file, folderId = '1gaY4NC7C1tK7vOoL2VKV90Cc8cks1EQ3') => {
    try {
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const params = new URLSearchParams();
      params.append('action', 'uploadFile');
      params.append('base64Data', base64Data);
      params.append('fileName', file.name);
      params.append('mimeType', file.type);
      params.append('folderId', folderId);

      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwZ96aXBp4sNGMzHjLf1iq98Pj1u6agtAb02Qv2KvdYYf7bzqrXAxWRxJ2LJIXVyN453g/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'File upload failed');
      }

      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  };

const updateEnquirySheet = async (enquiryNo, timestamp) => {
  const URL = 'https://script.google.com/macros/s/AKfycbwZ96aXBp4sNGMzHjLf1iq98Pj1u6agtAb02Qv2KvdYYf7bzqrXAxWRxJ2LJIXVyN453g/exec';

  try {
    const params = new URLSearchParams();
    params.append('sheetName', 'ENQUIRY');
    params.append('action', 'updateColumnAB');
    params.append('enquiryNo', enquiryNo);
    params.append('timestamp', timestamp);

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error updating enquiry sheet:', error);
    throw new Error(`Failed to update enquiry sheet: ${error.message}`);
  }
};

const handleJoiningSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    // Upload only the required files
    const uploadPromises = {};
    const fileFields = [
      'aadharFrontPhoto',
      'bankPassbookPhoto',
      'salarySlip' 
    ];

    for (const field of fileFields) {
      if (joiningFormData[field]) {
        uploadPromises[field] = uploadFileToDrive(joiningFormData[field]);
      } else {
        uploadPromises[field] = Promise.resolve('');
      }
    }

    // Wait for all uploads to complete
    const uploadedUrls = await Promise.all(
      Object.values(uploadPromises).map(promise => 
        promise.catch(error => {
          console.error('Upload failed:', error);
          return ''; // Return empty string if upload fails
        })
      )
    );

    // Map uploaded URLs to their respective fields
    const fileUrls = {};
    Object.keys(uploadPromises).forEach((field, index) => {
      fileUrls[field] = uploadedUrls[index];
    });

    // Format the timestamp in the required format: 9/8/2025 10:55:38
    const now = new Date();
    const formattedTimestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    
    // Create an array with all column values in order
    const rowData = [];
    
    // Assign values directly to array indices according to specified columns
    rowData[0] = formattedTimestamp;           // Column A: Timestamp
    rowData[1] = "";
    rowData[2] = joiningFormData.nameAsPerAadhar;   // Column C: Name As Per Aadhar
    rowData[3] = joiningFormData.fatherName;   // Column D: Father Name
    rowData[4] = joiningFormData.dateOfJoining; // Column E: Date Of Joining
    rowData[5] = joiningFormData.designation; // Column F: Designation
    rowData[6] = fileUrls.aadharFrontPhoto;    // Column G: Aadhar card
    rowData[7] = selectedCandidate?.candidatePhoto || '';  // Column H: Candidate Photo (auto-filled from selected candidate)
    rowData[8] = joiningFormData.currentAddress;  // Column I: Current Address
    rowData[9] = joiningFormData.dobAsPerAadhar; // Column J: Date Of Birth
    rowData[10] = joiningFormData.gender;      // Column K: Gender
    rowData[11] = joiningFormData.mobileNo; // Column L: Mobile No.
    rowData[12] = joiningFormData.familyMobileNo; // Column M: Family Mobile Number
    rowData[13] = joiningFormData.relationshipWithFamily; // Column N: Relationship With Family
    rowData[14] = joiningFormData.currentBankAc; // Column O: Current Account No
    rowData[15] = joiningFormData.ifscCode;    // Column P: IFSC Code
    rowData[16] = joiningFormData.branchName;  // Column Q: Branch Name
    rowData[17] = fileUrls.bankPassbookPhoto;  // Column R: Photo Of Front Bank Passbook
    rowData[18] = joiningFormData.personalEmail; // Column S: Candidate Email
    rowData[19] = joiningFormData.highestQualification; // Column T: Highest Qualification
    rowData[20] = joiningFormData.department;  // Column U: Department
    rowData[21] = joiningFormData.equipment;   // Column V: Equipment
    rowData[22] = joiningFormData.aadharCardNo;       // Column W: Aadhar Number
    rowData[23] = selectedCandidate?.candidateResume || ''; // Column X: Candidate Resume (auto-filled from selected candidate)
    rowData[24] = "";
    rowData[25] = "";
    rowData[26] = formattedTimestamp; // Column AA: Actual Date
    rowData[38] = fileUrls.salarySlip || "";    // Column AM: Last Salary Slip
    rowData[40] = joiningFormData.panCardNumber;

    await postToJoiningSheet(rowData);

    // Update ENQUIRY sheet Column AB with the timestamp if candidate was selected
    if (selectedCandidate?.candidateEnquiryNo) {
      // Send second POST request to update Column AB
      const updateParams = new URLSearchParams();
      updateParams.append('action', 'updateEnquiryColumn');
      updateParams.append('sheetName', 'ENQUIRY');
      updateParams.append('enquiryNo', selectedCandidate.candidateEnquiryNo);
      updateParams.append('timestamp', formattedTimestamp);

      const updateResponse = await fetch(
        'https://script.google.com/macros/s/AKfycbwZ96aXBp4sNGMzHjLf1iq98Pj1u6agtAb02Qv2KvdYYf7bzqrXAxWRxJ2LJIXVyN453g/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: updateParams,
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }

      const updateResult = await updateResponse.json();
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update enquiry column');
      }
    }

 console.log("Joining Form Data:", rowData);

    // Show success animation
    setShowSuccessAnimation(true);
    
    // Reset form and close modal after animation
    setTimeout(() => {
      toast.success('Employee added successfully!');
      setShowJoiningModal(false);
      
      setJoiningFormData({
        joiningId: '',
        nameAsPerAadhar: '',
        fatherName: '',
        dateOfJoining: '',
        joiningPlace: '',
        designation: '',
        salary: '',
        aadharFrontPhoto: null,
        aadharBackPhoto: null,
        panCardNumber: '',
        candidatePhoto: null,
        currentAddress: '',
        addressAsPerAadhar: '',
        dobAsPerAadhar: '',
        gender: '',
        mobileNo: '',
        familyMobileNo: '',
        relationshipWithFamily: '',
        pastPfId: '',
        currentBankAc: '',
        ifscCode: '',
        branchName: '',
        bankPassbookPhoto: null,
        personalEmail: '',
        esicNo: '',
        highestQualification: '',
        pfEligible: '',
        esicEligible: '',
        joiningCompanyName: '',
        emailToBeIssue: '',
        issueMobile: '',
        issueLaptop: '',
        aadharCardNo: '',
        modeOfAttendance: '',
        qualificationPhoto: null,
        paymentMode: '',
        salarySlip: null,
        resumeCopy: null,
        department: '',
        equipment: ''
      });
      setSelectedCandidate(null);
      setShowCandidateList(true);
    }, 2500);
  } catch (error) {
    console.error('Error submitting joining form:', error);
    toast.error(`Failed to submit joining form: ${error.message}`);
  } finally {
    setSubmitting(false);
  }
};

const filteredEnquiryData = enquiryData.filter(item => {
  const matchesSearch = item.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.applyingForPost?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.candidatePhone?.toLowerCase().includes(searchTerm.toLowerCase());
  
  // Only show candidates where Column AB is null/empty
  const hasNullColumnAB = !item.columnAB;
  
  return matchesSearch && hasNullColumnAB;
});


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-300 bg-indigo-700 text-white">
            <h1 className="text-xl md:text-2xl font-bold">
              Employee Joining Form
            </h1>
            <button
              onClick={() => setShowJoiningModal(false)}
              className="text-white hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Selected Candidate Info */}
          {selectedCandidate && !showCandidateList && (
            <div className="p-4 bg-blue-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Selected Candidate:
                  </p>
                  <p className="text-lg font-semibold text-blue-800">
                    {selectedCandidate.candidateName}
                  </p>
                  <p className="text-sm text-blue-700">
                    {selectedCandidate.applyingForPost} -{" "}
                    {selectedCandidate.department}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleJoiningSubmit} className="p-4 md:p-6 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining ID (जॉइनिंग आईडी)
                </label>
                <input
                  type="text"
                  name="joiningId"
                  value={joiningFormData.joiningId}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name As Per Aadhar
                </label>
                <input
                  type="text"
                  name="nameAsPerAadhar"
                  value={joiningFormData.nameAsPerAadhar}
                  disabled
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={joiningFormData.fatherName}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Of Birth As per Aadhar
                </label>
                <input
                  type="date"
                  name="dobAsPerAadhar"
                  value={joiningFormData.dobAsPerAadhar}
                  disabled
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={joiningFormData.gender}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={joiningFormData.department}
                  disabled
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <input
                  type="text"
                  name="equipment"
                  value={joiningFormData.equipment}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile No.
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={joiningFormData.mobileNo}
                  disabled
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Email
                </label>
                <input
                  type="email"
                  name="personalEmail"
                  value={joiningFormData.personalEmail}
                  disabled
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Family Mobile Number
                </label>
                <input
                  name="familyMobileNo"
                  value={joiningFormData.familyMobileNo}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship With Family
                </label>
                <input
                  name="relationshipWithFamily"
                  value={joiningFormData.relationshipWithFamily}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
            </div>

            {/* Section 3: Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Address
                </label>
                <textarea
                  name="currentAddress"
                  value={joiningFormData.currentAddress}
                  disabled
                  onChange={handleJoiningInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                />
              </div>
            </div>

            {/* Section 4: Employment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Of Joining
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={joiningFormData.dateOfJoining}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={joiningFormData.designation}
                  disabled
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highest Qualification
                </label>
                <input
                  name="highestQualification"
                  value={joiningFormData.highestQualification}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
            </div>

            {/* Section 5: Bank & Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Card Number
                </label>
                <input
                  name="aadharCardNo"
                  value={joiningFormData.aadharCardNo}
                  disabled
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pan Card Number
                </label>
                <input
                  name="panCardNumber"
                  value={joiningFormData.panCardNumber || ""} // Ensure it's never null
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Bank Account No
                </label>
                <input
                  name="currentBankAc"
                  value={joiningFormData.currentBankAc}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  name="ifscCode"
                  value={joiningFormData.ifscCode}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name
                </label>
                <input
                  name="branchName"
                  value={joiningFormData.branchName}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
            </div>

            {/* Section 6: Document Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Card
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "aadharFrontPhoto")}
                    className="hidden"
                    id="aadhar-front-upload"
                  />
                  <label
                    htmlFor="aadhar-front-upload"
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Photo
                  </label>
                  {joiningFormData.aadharFrontPhoto && (
                    <span className="text-sm text-gray-700">
                      {joiningFormData.aadharFrontPhoto.name}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo Of Front Bank Passbook
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "bankPassbookPhoto")}
                    className="hidden"
                    id="bank-passbook-upload"
                  />
                  <label
                    htmlFor="bank-passbook-upload"
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Photo
                  </label>
                  {joiningFormData.bankPassbookPhoto && (
                    <span className="text-sm text-gray-700">
                      {joiningFormData.bankPassbookPhoto.name}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Salary Slip
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "salarySlip")}
                    className="hidden"
                    id="salary-slip-upload"
                  />
                  <label
                    htmlFor="salary-slip-upload"
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Salary Slip
                  </label>
                  {joiningFormData.salarySlip && (
                    <span className="text-sm text-gray-700">
                      {joiningFormData.salarySlip.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Auto-filled candidate data display */}
            {selectedCandidate && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Auto-filled from Selected Candidate
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Candidate Photo
                    </label>
                    {selectedCandidate.candidatePhoto ? (
                      <a
                        href={selectedCandidate.candidatePhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        View Photo
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Not available
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Candidate Resume
                    </label>
                    {selectedCandidate.candidateResume ? (
                      <a
                        href={selectedCandidate.candidateResume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        View Resume
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Not available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setShowJoiningModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white bg-indigo-700 rounded-md hover:bg-indigo-800 flex items-center justify-center min-h-[42px] ${
                  submitting ? "opacity-90 cursor-not-allowed" : ""
                }`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl animate-scaleIn">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                <svg
                  className="w-16 h-16 text-green-600 animate-checkmark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ripple"></div>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-gray-800">Success!</h3>
            <p className="mt-2 text-gray-600 text-center">
              Employee added successfully
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes checkmark {
          0% {
            stroke-dasharray: 0, 100;
          }
          100% {
            stroke-dasharray: 100, 100;
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-checkmark {
          stroke-dasharray: 100;
          animation: checkmark 0.6s ease-in-out 0.3s forwards;
        }
        
        .animate-ripple {
          animation: ripple 1.5s ease-out infinite;
        }
      `}</style>
    </div>
  );
};

export default JoiningForm;