import { useState } from 'react';
import api from '../api/api';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert('Please provide a name');
    if (!username) return alert('Please provide a username');
    if (!email) return alert('Please provide an email address');
    if (!password) return alert('Please choose a password');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('affiliation', affiliation);
    formData.append('password', password)

    try {
      const response = await api.post('/users/', formData, {  // TODO: FIX ERROR RAISED WHEN USER IS CREATED SUCCESSFULLY
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Response: ', response);
      alert('User created successfully!');
    } catch (error: any) {
      console.error('Error details: ', error.response || error);
    //   if (error.response) {
    //     alert(`Server error: ${error.response.status} - ${error.response.data?.detail || 'Unknown'}`)
    //   } else {
    //     alert('Network or parsing error.');
    //   }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto mt-6">
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="text" placeholder="Affiliation" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
      <input type="text" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default SignupForm;
