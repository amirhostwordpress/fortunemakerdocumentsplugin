import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

import FormFieldManager from './FormFieldManager';
import PDFTemplateManager from './PDFTemplateManager';
import EmailSetupGuide from '../common/EmailSetupGuide';
import CostManagement from './CostManagement';
import FileUpload from '../common/FileUpload';
import UserManagement from './UserManagement';
import { 
  Settings, 
  Users, 
  FileText, 
  DollarSign, 
  Save,
  Eye,
  Edit,
  Download,
  MessageCircle,
  ArrowLeft,
  FormInput,
  Database,
  BarChart3,
  LogOut,
  RefreshCw,
  Search,
  X
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { settings, updateSettings, uploadLogo, quotes, setIsAdminMode } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<{
    id: string;
    data: Record<string, unknown>;
    pricing_data?: Record<string, unknown>;
    createdAt: string;
    status?: string;
  } | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      setSaveMessage(null);
      
      // Upload logo if a new file is selected
      if (selectedLogoFile) {
        await uploadLogo(selectedLogoFile);
        setSelectedLogoFile(null);
      }
      
      await updateSettings(tempSettings);
      setEditingSettings(false);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCancelEdit = () => {
    setTempSettings(settings);
    setEditingSettings(false);
    setSaveMessage(null);
  };

  const tabs = [
    { id: 'settings', label: 'Company Settings', icon: Settings },
    { id: 'cost-management', label: 'Cost Management', icon: DollarSign },
    { id: 'form-fields', label: 'Form Fields', icon: FormInput },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'quotes', label: 'Quote Requests', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'database', label: 'Data Export', icon: Database }
  ];

  const exportQuotesData = () => {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `luxone_quotes_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportSettingsData = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `luxone_settings_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    navigate('/');
  };

  const handleRefreshQuotes = async () => {
    try {
      setIsRefreshing(true);
      // Trigger a refresh of quotes data
      // This will be handled by the AdminContext
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh quotes:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter quotes based on search term
  const filteredQuotes = quotes.filter(quote => {
    const searchLower = searchTerm.toLowerCase();
    return (
      quote.id.toLowerCase().includes(searchLower) ||
      quote.data?.name?.toLowerCase().includes(searchLower) ||
      quote.data?.contactNumber?.toLowerCase().includes(searchLower) ||
      quote.data?.location?.toLowerCase().includes(searchLower) ||
      quote.data?.serviceLevel?.toLowerCase().includes(searchLower) ||
      quote.data?.email?.toLowerCase().includes(searchLower)
    );
  });



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {settings.logoFilePath ? (
                <img 
                  src={`https://theluxone.com/wp-content/uploads/2025/06/cropped-Luxone_HQ-1.png`}
                  alt="Company Logo"
                  className="w-12 h-12 object-contain rounded-lg"
                />
              ) : settings.logoUrl ? (
                <img 
                  src={settings.logoUrl}
                  alt="Company Logo"
                  className="w-12 h-12 object-contain rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Luxone Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Quotation</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Company Settings</h2>
                    {!editingSettings ? (
                      <button
                        onClick={() => setEditingSettings(true)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Edit size={16} />
                        <span>Edit Settings</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveSettings}
                          disabled={savingSettings}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                          <Save size={16} />
                          <span>{savingSettings ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {saveMessage && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      saveMessage.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-700' 
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {saveMessage.text}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Company Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Company Information
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={tempSettings.companyName}
                          onChange={(e) => setTempSettings({...tempSettings, companyName: e.target.value})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="text"
                          value={tempSettings.website}
                          onChange={(e) => setTempSettings({...tempSettings, website: e.target.value})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Address
                        </label>
                        <textarea
                          value={tempSettings.address}
                          onChange={(e) => setTempSettings({...tempSettings, address: e.target.value})}
                          disabled={!editingSettings}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                                              <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Logo
                          </label>
                          <FileUpload
                            onFileSelect={setSelectedLogoFile}
                            selectedFile={selectedLogoFile}
                            acceptedTypes="image/*"
                            maxSize={5 * 1024 * 1024} // 5MB
                            label="Upload Company Logo"
                          />
                          {tempSettings.logoUrl && !selectedLogoFile && (
                            <div className="mt-2 p-2 bg-gray-50 rounded border">
                              <p className="text-sm text-gray-600">Current logo: {tempSettings.logoFileName || 'Company Logo'}</p>
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Upload an image file (PNG, JPG, JPEG) for your company logo. Recommended size: 200x200px or larger.
                          </p>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Contact Information
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp India
                        </label>
                        <input
                          type="text"
                          value={tempSettings.whatsappIndia}
                          onChange={(e) => setTempSettings({...tempSettings, whatsappIndia: e.target.value})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp UAE
                        </label>
                        <input
                          type="text"
                          value={tempSettings.whatsappUAE}
                          onChange={(e) => setTempSettings({...tempSettings, whatsappUAE: e.target.value})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Email
                        </label>
                        <input
                          type="email"
                          value={tempSettings.adminEmail}
                          onChange={(e) => setTempSettings({...tempSettings, adminEmail: e.target.value})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Pricing Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Pricing Settings
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price per Sqft (AED)
                        </label>
                        <input
                          type="number"
                          value={tempSettings.pricePerSqft}
                          onChange={(e) => setTempSettings({...tempSettings, pricePerSqft: parseFloat(e.target.value)})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AED to USD Rate
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={tempSettings.aedToUsdRate}
                          onChange={(e) => setTempSettings({...tempSettings, aedToUsdRate: parseFloat(e.target.value)})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          VAT Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={tempSettings.vatRate}
                          onChange={(e) => setTempSettings({...tempSettings, vatRate: parseFloat(e.target.value)})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Sales Consultant */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Sales Consultant
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Consultant Name
                        </label>
                        <input
                          type="text"
                          value={tempSettings.consultantName}
                          onChange={(e) => setTempSettings({...tempSettings, consultantName: e.target.value})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Consultant Phone
                        </label>
                        <input
                          type="text"
                          value={tempSettings.consultantPhone}
                          onChange={(e) => setTempSettings({...tempSettings, consultantPhone: e.target.value})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Consultant Email
                        </label>
                        <input
                          type="email"
                          value={tempSettings.consultantEmail}
                          onChange={(e) => setTempSettings({...tempSettings, consultantEmail: e.target.value})}
                          disabled={!editingSettings}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cost-management' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <CostManagement />
              </div>
            )}

            {activeTab === 'form-fields' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <FormFieldManager />
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <UserManagement />
              </div>
            )}

            {activeTab === 'pdf-templates' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <PDFTemplateManager />
              </div>
            )}

            {activeTab === 'email-setup' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <EmailSetupGuide />
              </div>
            )}
            {activeTab === 'quotes' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Quote Requests</h2>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleRefreshQuotes}
                        disabled={isRefreshing}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                      </button>
                      <button
                        onClick={exportQuotesData}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        <Download size={16} />
                        <span>Export Data</span>
                      </button>
                      <span className="text-sm text-gray-600">
                        Total Quotes: {filteredQuotes.length} / {quotes.length}
                      </span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search quotes by ID, name, contact, location, service, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {filteredQuotes.length === 0 ? (
                    <div className="text-center py-12">
                      {searchTerm ? (
                        <>
                          <Search size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
                          <p className="text-gray-600">No quotes match your search criteria.</p>
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-blue-600 hover:text-blue-700 underline"
                          >
                            Clear search
                          </button>
                        </>
                      ) : (
                        <>
                          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
                          <p className="text-gray-600">Quote requests will appear here when customers submit them.</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Quote ID</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Total Cost</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredQuotes.map((quote) => {
                            // Parse pricing data to get total cost
                            let totalCost = 'N/A';
                            try {
                              if (quote.pricing_data) {
                                const pricingData = typeof quote.pricing_data === 'string' 
                                  ? JSON.parse(quote.pricing_data) 
                                  : quote.pricing_data;
                                totalCost = pricingData.grandTotal 
                                  ? `AED ${Number(pricingData.grandTotal).toFixed(2)}`
                                  : 'N/A';
                              }
                            } catch (error) {
                              console.error('Error parsing pricing data for quote:', quote.id, error);
                            }

                            return (
                              <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-mono text-sm">{quote.id}</td>
                                <td className="py-3 px-4">{quote.data.name}</td>
                                <td className="py-3 px-4">{quote.data.contactNumber}</td>
                                <td className="py-3 px-4">{quote.data.location}</td>
                                <td className="py-3 px-4 text-sm">{quote.data.serviceLevel}</td>
                                <td className="py-3 px-4 font-mono text-sm font-semibold text-green-700">
                                  {totalCost}
                                </td>
                                <td className="py-3 px-4 text-sm">{new Date(quote.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-2">
                                    <button
                                      className="text-blue-600 hover:text-blue-700"
                                      onClick={() => {
                                        setSelectedQuote(quote);
                                        setShowQuoteModal(true);
                                      }}
                                    >
                                      <Eye size={16} />
                                    </button>
                                    <button className="text-green-600 hover:text-green-700">
                                      <Download size={16} />
                                    </button>
                                    <button className="text-green-600 hover:text-green-700">
                                      <MessageCircle size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Quotes</p>
                        <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
                      </div>
                      <FileText size={32} className="text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {quotes.filter(q => new Date(q.createdAt).getMonth() === new Date().getMonth()).length}
                        </p>
                      </div>
                      <Users size={32} className="text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Form Fields</p>
                        <p className="text-2xl font-bold text-gray-900">{settings.formFields.length}</p>
                      </div>
                      <FormInput size={32} className="text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {quotes.slice(0, 5).map((quote) => (
                      <div key={quote.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{quote.data.name}</p>
                          <p className="text-sm text-gray-600">
                            Submitted quote request • {new Date(quote.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">{quote.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Data Management</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
                      <div className="space-y-3">
                        <button
                          onClick={exportQuotesData}
                          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                        >
                          <Download size={16} />
                          <span>Export Quotes Data</span>
                        </button>
                        <button
                          onClick={exportSettingsData}
                          className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                        >
                          <Download size={16} />
                          <span>Export Settings Data</span>
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Statistics</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Quotes:</span>
                          <span className="font-medium">{quotes.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Form Fields:</span>
                          <span className="font-medium">{settings.formFields.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">PDF Templates:</span>
                          <span className="font-medium">{settings.pdfTemplates.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Template:</span>
                          <span className="font-medium">{settings.activePdfTemplate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quote Details Modal */}
      {showQuoteModal && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-lg">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setShowQuoteModal(false)}
              >
                ×
              </button>
              <h2 className="text-xl font-bold pr-8">Quote Details - {selectedQuote.id}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quote Data Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Quote Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedQuote.data || {})
                      .filter(([, value]) => {
                        // Filter out empty, null, or "N/A" values
                        if (value === null || value === undefined || value === '') return false;
                        if (typeof value === 'string' && value.trim() === '') return false;
                        return true;
                      })
                      .map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-semibold text-gray-700 mb-1 text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="text-gray-900 break-words text-sm">
                            {typeof value === 'object' && value !== null ? (
                              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(value, null, 2)}</pre>
                            ) : (
                              String(value)
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Pricing Data Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Pricing Breakdown
                  </h3>
                  {selectedQuote.pricing_data ? (
                    <div className="space-y-4">
                      {/* Parse pricing data */}
                      {(() => {
                        let pricingData;
                        try {
                          // Handle both string and object formats
                          pricingData = typeof selectedQuote.pricing_data === 'string' 
                            ? JSON.parse(selectedQuote.pricing_data) 
                            : selectedQuote.pricing_data;
                        } catch (error) {
                          console.error('Error parsing pricing data:', error);
                          pricingData = {};
                        }

                        return (
                          <>
                            {/* Pricing Data Overview - Updated Design */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-800 mb-3 text-sm flex items-center">
                                <DollarSign size={16} className="mr-2" />
                                Pricing Data Overview
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Object.entries(pricingData)
                                  .filter(([key, value]) => value !== null && value !== undefined && value !== '')
                                  .map(([key, value]) => (
                                    <div key={key} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                      <div className="text-xs text-blue-600 font-medium capitalize mb-1">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                      </div>
                                      <div className="text-sm text-gray-900 font-semibold">
                                        {typeof value === 'number' 
                                          ? (key.includes('Cost') || key.includes('total') || key.includes('Total') || key.includes('margin') || key.includes('vat') || key.includes('delivery') || key.includes('installation') || key.includes('cutting') || key.includes('polishing'))
                                            ? `AED ${Number(value).toFixed(2)}`
                                            : value
                                          : String(value)
                                        }
                                      </div>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                            
                            {/* Slab Calculation Info */}
                            <div className="bg-blue-100 p-3 rounded-lg text-xs">
                              <p className="font-semibold mb-2 text-blue-800">Slab Calculation Logic:</p>
                              <ul className="text-blue-700 space-y-1">
                                <li>• Each slab = 5.12 sqm</li>
                                <li>• Total area ÷ 5.12 = slabs required (rounded up)</li>
                                <li>• Base cost per slab = 280 AED</li>
                                <li>• Material cost = slabs required × 280 AED</li>
                              </ul>
                            </div>

                            {/* Material & Fabrication Costs */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-3 text-sm">Material & Fabrication</h4>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-blue-700">Material Cost:</span>
                                  <span className="font-mono text-blue-900">
                                    AED {pricingData.materialCost ? Number(pricingData.materialCost).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-blue-700">Cutting:</span>
                                  <span className="font-mono text-blue-900">
                                    AED {pricingData.cutting ? Number(pricingData.cutting).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-blue-700">Top Polishing:</span>
                                  <span className="font-mono text-blue-900">
                                    AED {pricingData.topPolishing ? Number(pricingData.topPolishing).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-blue-700">Polishing:</span>
                                  <span className="font-mono text-blue-900">
                                    AED {pricingData.polishing ? Number(pricingData.polishing).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-blue-700">Installation:</span>
                                  <span className="font-mono text-blue-900">
                                    AED {pricingData.installation ? Number(pricingData.installation).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-blue-700">Total Area (sqm):</span>
                                  <span className="font-mono text-blue-900">
                                    {pricingData.totalSqm ? Number(pricingData.totalSqm).toFixed(4) : '0.0000'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-blue-700">Slabs Required:</span>
                                  <span className="font-mono text-blue-900">
                                    {pricingData.slabsRequired || '0'} (5.12 sqm each)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Additional Services */}
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-green-800 mb-3 text-sm">Additional Services</h4>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-700">Installation:</span>
                                  <span className="font-mono text-green-900">
                                    AED {pricingData.installation ? Number(pricingData.installation).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-700">Delivery:</span>
                                  <span className="font-mono text-green-900">
                                    AED {pricingData.delivery ? Number(pricingData.delivery).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-700">Add-on Services:</span>
                                  <span className="font-mono text-green-900">
                                    AED {pricingData.addonCost ? Number(pricingData.addonCost).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                              </div>
                              {/* Service Level Note */}
                              <div className="mt-2 text-xs text-green-800">
                                {selectedQuote.data.serviceLevel === 'fabrication' && (
                                  <span>Note: Delivery, packing, and installation are <b>not</b> charged for this scope.</span>
                                )}
                                {selectedQuote.data.serviceLevel === 'fabrication-delivery' && (
                                  <span>Note: Delivery and packing are charged, but installation is <b>not</b> charged for this scope.</span>
                                )}
                                {selectedQuote.data.serviceLevel === 'fabrication-delivery-installation' && (
                                  <span>Note: Full cost including installation is charged for this scope.</span>
                                )}
                              </div>
                              {/* Timeline Display */}
                              <div className="mt-2 text-xs text-blue-800">
                                <b>Estimated Timeline:</b>{" "}
                                {(() => {
                                  switch(selectedQuote.data.timeline) {
                                    case 'asap-2weeks': return 'ASAP to 2 Weeks';
                                    case '3-6weeks': return '3 to 6 Weeks';
                                    case '6weeks-plus': return '6 Weeks or more';
                                    default: return selectedQuote.data.timeline || 'N/A';
                                  }
                                })() || ''}
                              </div>
                            </div>

                            {/* Cost Summary */}
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-purple-800 mb-3 text-sm">Cost Summary</h4>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-purple-700">Subtotal:</span>
                                  <span className="font-mono text-purple-900">
                                    AED {pricingData.subtotal ? Number(pricingData.subtotal).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-purple-700">Profit Margin:</span>
                                  <span className="font-mono text-purple-900">
                                    AED {pricingData.margin ? Number(pricingData.margin).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold border-t border-purple-200 pt-2">
                                  <span className="text-purple-800">Subtotal with Margin:</span>
                                  <span className="font-mono text-purple-900">
                                    AED {pricingData.subtotalWithMargin ? Number(pricingData.subtotalWithMargin).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Final Total */}
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-orange-800 mb-3 text-sm">Final Total</h4>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-orange-700">VAT (5%):</span>
                                  <span className="font-mono text-orange-900">
                                    AED {pricingData.vat ? Number(pricingData.vat).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-orange-200 pt-2">
                                  <span className="text-orange-800">Grand Total:</span>
                                  <span className="font-mono text-orange-900">
                                    AED {pricingData.grandTotal ? Number(pricingData.grandTotal).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-yellow-800 text-sm">No pricing data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Quote Metadata */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Metadata</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-semibold text-gray-700 mb-1 text-sm">Quote ID</div>
                    <div className="text-gray-900 font-mono text-sm">{selectedQuote.id}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-semibold text-gray-700 mb-1 text-sm">Created At</div>
                    <div className="text-gray-900 text-sm">{new Date(selectedQuote.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;