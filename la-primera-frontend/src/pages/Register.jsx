import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import registerLogo from "../assets/img/logo1.PNG";



function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      await register(formData);
      setSuccessMessage('Registrasi berhasil! Akun Anda telah dibuat. Anda akan diarahkan...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      if (error?.response === undefined && error?.message?.includes('Network Error')) {
        setErrors({ general: 'Gagal terhubung ke server. Pastikan koneksi internet dan backend Anda berjalan.' });
      } else if (error?.errors) {
        setErrors(error.errors);
      } else if (error?.message) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.' });
      }
    }
  };

  const renderError = (fieldName) => {
    if (errors[fieldName]) {
      const errorMessage = Array.isArray(errors[fieldName]) ? errors[fieldName][0] : errors[fieldName];
      return <p className="mt-1 text-sm text-red-600">{errorMessage}</p>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 overflow-hidden bg-white">
                                         <img src={registerLogo} alt="Logo Produk" className="w-full h-full object-contain" />
                                        </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join With Us</h2>
          <p className="text-gray-600"></p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-800 text-sm">{successMessage}</p></div>
          )}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-800 text-sm">{errors.general}</p></div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Depan</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={`w-full px-4 py-3 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300`} placeholder="John" required/>
                {renderError('firstName')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Belakang</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={`w-full px-4 py-3 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300`} placeholder="Doe" required/>
                {renderError('lastName')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300`} placeholder="john@example.com" required/>
              {renderError('email')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300`} placeholder="08123456789" required/>
              {renderError('phone')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className={`w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300`} placeholder="••••••••" required/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>}
                </button>
              </div>
              {renderError('password')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300`} placeholder="••••••••" required/>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>}
                </button>
              </div>
              {renderError('confirmPassword')}
            </div>
            <button
  type="submit"
  disabled={loading}
  className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25 flex items-center justify-center"
>
  
  {loading ? (
    <>
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
      Memproses...
    </>
  ) : (
    "Buat Akun Baru"
  )}
</button>" 
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?
              <Link to="/login" className="ml-1 text-red-600 hover:text-red-500 font-medium">Masuk di sini</Link>
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Dengan mendaftar, Anda menyetujui{' '}
              <Link to="/terms" className="text-red-600 hover:text-red-500">Syarat & Ketentuan</Link>{' '}dan{' '}
              <Link to="/privacy" className="text-red-600 hover:text-red-500">Kebijakan Privasi</Link>{' '}kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;