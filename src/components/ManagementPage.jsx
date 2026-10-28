import React, { useState } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Building2, 
  Users, 
  Lightbulb, 
  Settings2, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ManagementPage({ 
  classrooms, 
  addRoom, 
  deleteRoom,
  useMock
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    roomName: '',
    building: 'Main Block',
    capacity: 65,
    occupancy: 0,
    lightStatus: 'OFF'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.roomName) {
      setMessage({ type: 'error', text: 'Please fill in required fields (ID & Room Name).' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await addRoom({
        id: formData.id.trim().toUpperCase(),
        roomName: formData.roomName.trim(),
        building: formData.building.trim(),
        capacity: Number(formData.capacity) || 65,
        occupancy: Number(formData.occupancy) || 0,
        lightStatus: formData.lightStatus
      });

      setMessage({ type: 'success', text: `Classroom ${formData.id} successfully registered!` });
      setFormData({
        id: '',
        roomName: '',
        building: 'Main Block',
        capacity: 65,
        occupancy: 0,
        lightStatus: 'OFF'
      });
      setIsModalOpen(false);
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to create room: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (window.confirm(`Are you sure you want to remove classroom "${roomId}" from system tracking?`)) {
      await deleteRoom(roomId);
      setMessage({ type: 'success', text: `Classroom ${roomId} removed.` });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-sky-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-sky-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Settings2 className="w-4 h-4" />
            <span>Classroom Node Configuration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Classroom Management</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Register new physical classroom nodes, adjust room capacities, or decommission unused IoT sensors from the database.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-md shadow-sky-200 transition-all duration-200"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span>Add Classroom Node</span>
        </button>
      </div>

      {/* Status Messages */}
      {message && (
        <div className={`p-4 rounded-2xl border text-sm font-medium flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Classrooms Management Table */}
      <div className="glass-card rounded-3xl border-sky-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-sky-100 flex items-center justify-between bg-white">
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Registered Classrooms ({classrooms.length})</h3>
          <span className="text-xs text-slate-500 font-mono">
            {useMock ? 'Storage: Mock In-Memory' : 'Storage: Firebase RTDB'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-sky-50/70 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-sky-100">
              <tr>
                <th className="px-6 py-4">Room ID</th>
                <th className="px-6 py-4">Room Name</th>
                <th className="px-6 py-4">Building</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Current Occupancy</th>
                <th className="px-6 py-4">Light State</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classrooms.map((room) => (
                <tr key={room.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-sky-600">{room.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{room.roomName || room.id}</td>
                  <td className="px-6 py-4 text-slate-500">{room.building || "Main Campus"}</td>
                  <td className="px-6 py-4 font-mono text-slate-700">{room.capacity || 40} seats</td>
                  <td className="px-6 py-4">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                      (room.occupancy || 0) === 0 ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}>
                      {room.occupancy || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      room.lightStatus === 'ON' 
                        ? 'bg-sky-50 text-sky-700 border-sky-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {room.lightStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200"
                      title="Decommission classroom"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Classroom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 border border-sky-100 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-sky-600" />
                <h3 className="text-xl font-bold text-slate-900 font-outfit">Add New Classroom</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Room ID * (e.g. CS104)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CS104"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Max Capacity (1-500)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Room Name / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Advanced Robotics Lab 104"
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Building / Block Name
                </label>
                <input
                  type="text"
                  placeholder="Engineering Block B"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Initial Occupancy
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.capacity}
                    value={formData.occupancy}
                    onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Initial Light Status
                  </label>
                  <select
                    value={formData.lightStatus}
                    onChange={(e) => setFormData({ ...formData, lightStatus: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white"
                  >
                    <option value="OFF">OFF</option>
                    <option value="ON">ON</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors shadow-md shadow-sky-200"
                >
                  {submitting ? 'Registering...' : 'Register Classroom'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
