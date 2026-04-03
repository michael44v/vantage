import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const KYC = () => {
  const [docType, setDocType] = useState('id_card');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('not_submitted');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('kyc_file', file);
    // user_id is extracted on backend from token for security

    try {
      const response = await apiClient.post('/user/kyc_upload.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message);
      setStatus('pending');
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="kyc-container p-8 bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-800 p-12 rounded-3xl border border-gray-700 shadow-2xl">
        <h1 className="text-4xl font-black mb-4 text-center">Verify Identity</h1>
        <p className="text-gray-500 text-center mb-12">Submit your documents for manual review to unlock full account features.</p>

        {status === 'not_submitted' ? (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-3">
              <label className="block text-gray-400 font-bold uppercase text-xs tracking-widest">Document Category</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 p-5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-bold"
              >
                <option value="id_card">National ID Card</option>
                <option value="passport">International Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="proof_of_address">Proof of Address</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-400 font-bold uppercase text-xs tracking-widest">Digital Upload</label>
              <div className="border-2 border-dashed border-gray-700 rounded-2xl p-16 text-center hover:border-blue-500 transition-all cursor-pointer bg-gray-900/50 group">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="kyc_file"
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                <label htmlFor="kyc_file" className="cursor-pointer">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</div>
                  <span className="text-gray-400 block mb-2 font-medium">{file ? file.name : "Drag files here or browse"}</span>
                  <span className="text-blue-500 font-black uppercase text-sm tracking-widest">Select Document</span>
                </label>
              </div>
              <p className="text-xs text-gray-600 text-center">* Max size: 10MB. Formats: JPG, PNG, PDF.</p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl font-black text-xl shadow-lg hover:shadow-blue-500/10 transition-all active:scale-95"
            >
              Confirm and Submit
            </button>
          </form>
        ) : (
          <div className="text-center py-10">
            <div className={`text-8xl mb-8 animate-pulse ${status === 'pending' ? 'text-yellow-500' : 'text-green-500'}`}>
              {status === 'pending' ? '⚖️' : '🚀'}
            </div>
            <h3 className="text-3xl font-black mb-6">{status === 'pending' ? 'Review in Progress' : 'Account Ready'}</h3>
            <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
              {status === 'pending'
                ? "Your documents have been securely uploaded and are waiting for an administrator's approval. This usually takes 2-4 hours during business days."
                : "Congratulations! Your account has been fully verified. You can now access all professional trading tools and withdraw funds."}
            </p>
            <div className="mt-12">
               <a href="/dashboard" className="text-blue-500 hover:underline font-bold uppercase tracking-widest text-xs">Return to Dashboard</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYC;
