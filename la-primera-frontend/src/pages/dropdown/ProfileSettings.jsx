import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';

const ProfileInfoRow = ({ label, value }) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value || '-'}</dd>
  </div>
);

function ProfileSettings() {
  const { user, updateProfile, updatePassword, updateAvatar, loading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarInputRef = useRef(null);
  
  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar);
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setErrors({});
    setSuccessMessage('');
    try {
      await updateAvatar(avatarFile);
      setAvatarFile(null);
      setSuccessMessage('Avatar berhasil diperbarui!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ general: error.message || 'Gagal mengunggah avatar.' });
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    try {
      await updateProfile(profileData);
      setSuccessMessage('Profil berhasil diperbarui!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (error?.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ general: error.message || 'Terjadi kesalahan.' });
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: ['Password baru dan konfirmasi password tidak cocok.'] });
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccessMessage('Password berhasil diperbarui!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (error?.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ general: error.message || 'Terjadi kesalahan saat memperbarui password.' });
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="relative w-32 h-32 mx-auto">
            <img 
              src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=d94c4a&color=fff&size=128`} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover shadow-lg"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-all"
              title="Ubah Avatar"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={avatarInputRef}
              onChange={handleAvatarFileChange}
            />
          </div>
          {avatarFile && (
            <div className="mt-4">
              <button
                onClick={handleAvatarUpload}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Mengunggah...' : 'Simpan Avatar Baru'}
              </button>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{user?.name}</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {successMessage && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{successMessage}</div>}
        {errors.general && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{errors.general}</div>}

        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg shadow-md p-2 flex space-x-2 flex-wrap">
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === 'profile' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:text-red-600'}`}>Profil</button>
            <button onClick={() => setActiveTab('password')} className={`px-4 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === 'password' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:text-red-600'}`}>Password</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Informasi Profil</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg hover:bg-red-200 transition-colors">Edit Profil</button>
                )}
              </div>
              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                      <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500`} required />
                      {renderError('name')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500`} required />
                      {renderError('email')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                      <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500`} />
                      {renderError('phone')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                      <input type="date" name="birth_date" value={profileData.birth_date} onChange={handleProfileChange} className={`w-full px-4 py-3 border ${errors.birth_date ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500`} />
                      {renderError('birth_date')}
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                    <select name="gender" value={profileData.gender} onChange={handleProfileChange} className={`w-full px-4 py-3 border ${errors.gender ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500`}>
                      <option value="">Pilih jenis kelamin</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                      <option value="other">Lainnya</option>
                    </select>
                    {renderError('gender')}
                  </div>
                  <div className="flex justify-end gap-4">
                    <button type="button" onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors">Batal</button>
                    <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-8 rounded-lg transition-colors">{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                  </div>
                </form>
              ) : (
                <div className="border-t border-gray-200">
                  <dl className="divide-y divide-gray-200">
                    <ProfileInfoRow label="Nama Lengkap" value={user?.name} />
                    <ProfileInfoRow label="Email" value={user?.email} />
                    <ProfileInfoRow label="Nomor Telepon" value={user?.phone} />
                    <ProfileInfoRow label="Tanggal Lahir" value={user?.birth_date} />
                    <ProfileInfoRow label="Jenis Kelamin" value={user?.gender} />
                  </dl>
                </div>
              )}
            </div>
          )}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ubah Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                  <div className="relative">
                    <input type={showCurrentPassword ? "text" : "password"} name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className={`w-full px-4 py-3 border ${errors.current_password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500`} required />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showCurrentPassword ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}</button>
                  </div>
                  {renderError('current_password')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className={`w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500`} required />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showNewPassword ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}</button>
                  </div>
                  {renderError('password')}
                  <p className="mt-1 text-sm text-gray-500">Minimal 8 karakter</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}</button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-8 rounded-lg transition-colors">{loading ? 'Memperbarui...' : 'Perbarui Password'}</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;