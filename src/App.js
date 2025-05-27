import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, Users, MapPin, ShoppingCart, FileCheck, AlertCircle, CheckCircle, Globe, Zap, Database, Settings } from 'lucide-react';

const EnterpriseDataMappingApp = () => {
  // Core state management
  const [files, setFiles] = useState({
    commissions: null,
    orders: null
  });
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [detectedSystem, setDetectedSystem] = useState(null);
  const [processingLog, setProcessingLog] = useState([]);
  const [step, setStep] = useState(1);
  
  // Template configuration state
  const [showTemplateConfig, setShowTemplateConfig] = useState(false);
  const [templateConfig, setTemplateConfig] = useState({
    customer: { enabled: true, fields: {} },
    location: { enabled: true, fields: {} },
    order: { enabled: true, fields: {} },
    contract: { enabled: true, fields: {} }
  });
  const [availableFields, setAvailableFields] = useState([]);
  const [fileFields, setFileFields] = useState({
    commissions: [],
    orders: []
  });
  const [expandedTemplates, setExpandedTemplates] = useState({
    customer: false,
    location: false,
    order: false,
    contract: false
  });

  // Dynamic template definitions based on uploaded files
  const getTemplateDefinitions = useCallback(() => {
    const commissionFields = fileFields.commissions || [];
    const orderFields = fileFields.orders || [];
    const allFields = [...new Set([...commissionFields, ...orderFields])];
    
    // Create prefixed versions for cross-file mapping
    const commissionPrefixed = commissionFields.map(field => `commission_${field}`);
    const orderPrefixed = orderFields.map(field => `order_${field}`);
    const allFieldsWithPrefixed = [...allFields, ...commissionPrefixed, ...orderPrefixed];

    return {
      customer: {
        name: 'Customer Template',
        icon: Users,
        color: 'blue',
        fields: allFieldsWithPrefixed,
        required: [],
        defaultSelected: commissionFields.slice(0, 8) // First 8 commission fields
      },
      location: {
        name: 'Location Template',
        icon: MapPin,
        color: 'green',
        fields: allFieldsWithPrefixed,
        required: [],
        defaultSelected: [...commissionFields.slice(0, 4), ...orderFields.slice(0, 4)] // Mix of both
      },
      order: {
        name: 'Order Template',
        icon: ShoppingCart,
        color: 'purple',
        fields: allFieldsWithPrefixed,
        required: [],
        defaultSelected: orderFields.slice(0, 8) // First 8 order fields
      },
      contract: {
        name: 'Contract Template',
        icon: FileText,
        color: 'orange',
        fields: allFieldsWithPrefixed,
        required: [],
        defaultSelected: [...commissionFields.slice(0, 4), ...orderFields.slice(0, 4)] // Mix of both
      }
    };
  }, [fileFields]);

  // System pattern definitions for auto-detection
  const systemPatterns = {
    'WINDSTREAM': {
      name: 'Windstream',
      commissionFields: ['ACCOUNTNBR', 'COMMDATE', 'COMMISSION', 'CUSTFNAME', 'CUSTLNAME', 'SALESID'],
      orderFields: ['Customer Name', 'Account Number', 'Service Status', 'Seller Name'],
      colorClasses: {
        bg: 'bg-blue-100',
        border: 'border-blue-300',
        text: 'text-blue-600',
        button: 'bg-blue-500 hover:bg-blue-600'
      }
    },
    'APPDIRECT': {
      name: 'AppDirect',
      commissionFields: ['Commission Cycle', 'Advisor ID', 'Provider Name', 'Comp Paid', 'Sales Rep'],
      orderFields: ['Order ID', 'Advisor Order #', 'Provider', 'Provider Customer Name'],
      colorClasses: {
        bg: 'bg-green-100',
        border: 'border-green-300',
        text: 'text-green-600',
        button: 'bg-green-500 hover:bg-green-600'
      }
    },
    'IBS': {
      name: 'IBS',
      commissionFields: ['Supplier', 'Assignment code', 'Net billed', 'Sales comm.', 'Customer'],
      orderFields: ['Number', 'Rep Name', 'Service Provider', 'Customer Name'],
      colorClasses: {
        bg: 'bg-purple-100',
        border: 'border-purple-300',
        text: 'text-purple-600',
        button: 'bg-purple-500 hover:bg-purple-600'
      }
    },
    'INTELISYS': {
      name: 'Intelisys',
      commissionFields: ['Line Item ID', 'Commission Run', 'RPM Order', 'Sales Comm.', 'Net Billed'],
      orderFields: ['RPM Order', 'Order Status', 'Supplier', 'Total Estimated MRC'],
      colorClasses: {
        bg: 'bg-orange-100',
        border: 'border-orange-300',
        text: 'text-orange-600',
        button: 'bg-orange-500 hover:bg-orange-600'
      }
    },
    'SANDLER': {
      name: 'Sandler/TopSpin',
      commissionFields: ['Agency', 'Commission Method', 'Provider Identifier', 'Agent comm.', 'Commission Type'],
      orderFields: ['Sandler Order #', 'Contract MRC', 'Contract Terms (Months)', 'Contract Sign Date'],
      colorClasses: {
        bg: 'bg-red-100',
        border: 'border-red-300',
        text: 'text-red-600',
        button: 'bg-red-500 hover:bg-red-600'
      }
    },
    'AVANT': {
      name: 'Avant/RPM',
      commissionFields: ['Provider', 'Rep', 'Net Billed', 'Sales Commission', 'DISCONNECT DATE'],
      orderFields: ['Supplier', 'Customer', 'Product', 'Install Date'],
      colorClasses: {
        bg: 'bg-indigo-100',
        border: 'border-indigo-300',
        text: 'text-indigo-600',
        button: 'bg-indigo-500 hover:bg-indigo-600'
      }
    }
  };

  // Utility functions
  const addLog = useCallback((message, type = 'info') => {
    setProcessingLog(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  }, []);

  const getSystemColorClasses = (systemType) => {
    return systemPatterns[systemType]?.colorClasses || {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-600',
      button: 'bg-gray-500 hover:bg-gray-600'
    };
  };

  const getTemplateColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        button: 'bg-green-500 hover:bg-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        button: 'bg-purple-500 hover:bg-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        button: 'bg-orange-500 hover:bg-orange-600'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  // Template configuration utilities
  const initializeTemplateConfig = useCallback(() => {
    const templateDefinitions = getTemplateDefinitions();
    const config = {};
    
    Object.entries(templateDefinitions).forEach(([templateType, definition]) => {
      config[templateType] = {
        enabled: true,
        fields: {}
      };
      
      definition.fields.forEach(field => {
        config[templateType].fields[field] = {
          selected: definition.defaultSelected.includes(field),
          required: definition.required.includes(field),
          mappedTo: field
        };
      });
    });
    
    setTemplateConfig(config);
  }, [getTemplateDefinitions]);

  const toggleTemplateExpanded = useCallback((templateType) => {
    setExpandedTemplates(prev => ({
      ...prev,
      [templateType]: !prev[templateType]
    }));
  }, []);

  const toggleTemplateEnabled = useCallback((templateType) => {
    setTemplateConfig(prev => ({
      ...prev,
      [templateType]: {
        ...prev[templateType],
        enabled: !prev[templateType].enabled
      }
    }));
  }, []);

  const toggleFieldSelected = useCallback((templateType, fieldName) => {
    setTemplateConfig(prev => ({
      ...prev,
      [templateType]: {
        ...prev[templateType],
        fields: {
          ...prev[templateType].fields,
          [fieldName]: {
            ...prev[templateType].fields[fieldName],
            selected: !prev[templateType].fields[fieldName].selected
          }
        }
      }
    }));
  }, []);

  const updateFieldMapping = useCallback((templateType, fieldName, mappedTo) => {
    setTemplateConfig(prev => ({
      ...prev,
      [templateType]: {
        ...prev[templateType],
        fields: {
          ...prev[templateType].fields,
          [fieldName]: {
            ...prev[templateType].fields[fieldName],
            mappedTo: mappedTo
          }
        }
      }
    }));
  }, []);

  // System detection logic
  const detectSystemType = useCallback((commissionHeaders, orderHeaders) => {
    let bestMatch = { system: 'GENERIC', score: 0 };
    
    for (const [systemKey, config] of Object.entries(systemPatterns)) {
      let score = 0;
      let totalFields = config.commissionFields.length + config.orderFields.length;
      
      // Check commission field matches
      const commissionMatches = config.commissionFields.filter(field => 
        commissionHeaders.some(header => header.toLowerCase().includes(field.toLowerCase()))
      ).length;
      
      // Check order field matches  
      const orderMatches = config.orderFields.filter(field => 
        orderHeaders.some(header => header.toLowerCase().includes(field.toLowerCase()))
      ).length;
      
      // Calculate score as percentage of matching fields
      score = (commissionMatches + orderMatches) / totalFields;
      
      // Require at least 50% field match and at least 2 total matches
      if (score >= 0.5 && (commissionMatches + orderMatches) >= 2 && score > bestMatch.score) {
        bestMatch = { system: systemKey, score };
      }
    }
    
    // Log detection details for debugging
    console.log('System Detection Results:', {
      commissionHeaders: commissionHeaders.slice(0, 10),
      orderHeaders: orderHeaders.slice(0, 10),
      bestMatch
    });
    
    return bestMatch.system;
  }, []);

  // File handling with field analysis and system detection
  const handleFileUpload = useCallback(async (fileType, event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setFiles(prev => ({ ...prev, [fileType]: file }));
      addLog(`Uploaded ${fileType} file: ${file.name}`, 'success');
      
      // Analyze file fields immediately upon upload
      try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          setFileFields(prev => {
            const newFileFields = {
              ...prev,
              [fileType]: headers
            };
            
            // Check if we have both files uploaded and can detect system
            const updatedFiles = fileType === 'commissions' ? 
              { ...files, commissions: file } : 
              { ...files, orders: file };
            
            if (updatedFiles.commissions && updatedFiles.orders && newFileFields.commissions.length > 0 && newFileFields.orders.length > 0) {
              // Detect system type based on field headers
              const commissionHeaders = fileType === 'commissions' ? headers : newFileFields.commissions;
              const orderHeaders = fileType === 'orders' ? headers : newFileFields.orders;
              
              const systemType = detectSystemType(commissionHeaders, orderHeaders);
              setDetectedSystem(systemType);
              
              const systemName = systemPatterns[systemType]?.name || 'Generic System';
              addLog(`System detected: ${systemName} - Cross-file mapping rules applied`, 'success');
            }
            
            return newFileFields;
          });
          addLog(`Detected ${headers.length} fields in ${fileType} file`, 'info');
        }
      } catch (error) {
        addLog(`Error analyzing ${fileType} file: ${error.message}`, 'error');
      }
    } else {
      alert('Please upload a CSV file');
    }
  }, [addLog, detectSystemType, files, systemPatterns]);

  // CSV parsing with enhanced error handling
  const parseCSV = useCallback((text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/"/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/"/g, ''));
      
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  }, []);

  // System-specific field mappers
  const getFieldMapper = useCallback((system) => {
    const mappers = {
      'WINDSTREAM': {
        customer: (record) => `${record.CUSTFNAME || ''} ${record.CUSTLNAME || ''}`.trim() || record['Customer Name'],
        rep: (record) => record.SALESID || record['Seller Name'],
        commission: (record) => parseFloat(record.COMMISSION) || 0,
        revenue: (record) => parseFloat(record.REVENUE) || 0
      },
      'APPDIRECT': {
        customer: (record) => record.Customer || record['Provider Customer Name'] || '',
        rep: (record) => record['Sales Rep'] || record.Advisor || '',
        commission: (record) => parseFloat(record['Comp Paid']?.replace(/[$,()]/g, '')) || 0,
        revenue: (record) => parseFloat(record.Revenue?.replace(/[$,()]/g, '')) || 0
      },
      'IBS': {
        customer: (record) => record.Customer || record['Customer Name'],
        rep: (record) => record.Rep || record['Rep Name'],
        commission: (record) => parseFloat(record['Sales comm.']?.replace(/[$,()]/g, '')) || 0,
        revenue: (record) => parseFloat(record['Net billed']?.replace(/[$,()]/g, '')) || parseFloat(record.MRC?.replace(/[$,()]/g, '')) || 0
      },
      'INTELISYS': {
        customer: (record) => record.Customer,
        rep: (record) => record.Rep,
        commission: (record) => parseFloat(record['Sales Comm.']?.replace(/[$,()]/g, '')) || 0,
        revenue: (record) => parseFloat(record['Net Billed']?.replace(/[$,()]/g, '')) || parseFloat(record['Total Estimated MRC']?.replace(/[$,()]/g, '')) || 0
      },
      'SANDLER': {
        customer: (record) => record.Customer,
        rep: (record) => record.Rep,
        commission: (record) => parseFloat(record['Agent comm.']) || 0,
        revenue: (record) => parseFloat(record['Net Billed']) || parseFloat(record['Contract MRC']) || 0
      },
      'AVANT': {
        customer: (record) => record.Customer,
        rep: (record) => record.Rep,
        commission: (record) => parseFloat(record['Sales Commission']) || 0,
        revenue: (record) => parseFloat(record['Net Billed']) || 0
      }
    };
    
    return mappers[system] || mappers['AVANT'];
  }, []);

  // Cross-reference data merging
  const createCrossReferencedData = useCallback((commissions, orders, fieldMapper) => {
    const crossReferencedData = new Map();
    
    // Index commission data by customer and account
    commissions.forEach(commissionRow => {
      const customer = fieldMapper.customer(commissionRow);
      const account = commissionRow.Account || commissionRow['Account Number'] || 
                     commissionRow.ACCOUNTNBR || commissionRow['Acct #'] || 
                     commissionRow['Account #'] || commissionRow['Provider Account #'];
      
      const key = `${customer}|${account || 'default'}`;
      
      if (!crossReferencedData.has(key)) {
        crossReferencedData.set(key, {
          customer,
          account,
          commissionData: [],
          orderData: [],
          combinedData: {}
        });
      }
      
      crossReferencedData.get(key).commissionData.push(commissionRow);
      Object.entries(commissionRow).forEach(([field, value]) => {
        crossReferencedData.get(key).combinedData[`commission_${field}`] = value;
        crossReferencedData.get(key).combinedData[field] = value;
      });
    });
    
    // Match and merge order data
    orders.forEach(orderRow => {
      const customer = fieldMapper.customer(orderRow);
      const account = orderRow.Account || orderRow['Account Number'] || 
                     orderRow.ACCOUNTNBR || orderRow.Number || 
                     orderRow['Provider Account #'] || orderRow['Sandler Order #'];
      
      const key = `${customer}|${account || 'default'}`;
      
      if (!crossReferencedData.has(key)) {
        crossReferencedData.set(key, {
          customer,
          account,
          commissionData: [],
          orderData: [],
          combinedData: {}
        });
      }
      
      crossReferencedData.get(key).orderData.push(orderRow);
      Object.entries(orderRow).forEach(([field, value]) => {
        crossReferencedData.get(key).combinedData[`order_${field}`] = value;
        if (!crossReferencedData.get(key).combinedData[field]) {
          crossReferencedData.get(key).combinedData[field] = value;
        }
      });
    });
    
    return crossReferencedData;
  }, []);

  // Field value extraction with template configuration
  const getFieldValue = useCallback((combinedRecord, fieldName, templateConfig, templateType) => {
    if (!templateConfig[templateType] || !templateConfig[templateType].fields[fieldName]) {
      return combinedRecord[fieldName] || '';
    }
    
    const mappedField = templateConfig[templateType].fields[fieldName].mappedTo || fieldName;
    return combinedRecord[mappedField] || combinedRecord[fieldName] || '';
  }, []);

  // Main processing function
  const processFiles = useCallback(async () => {
    if (!files.commissions || !files.orders) {
      alert('Please upload both commission and order files');
      return;
    }

    setProcessing(true);
    setStep(2);
    setProcessingLog([]);

    try {
      addLog('Starting file processing...', 'info');
      
      // Read and parse files
      const commissionText = await files.commissions.text();
      const orderText = await files.orders.text();
      
      const commissionData = parseCSV(commissionText);
      const orderData = parseCSV(orderText);

      addLog(`Parsed ${commissionData.length} commission records`, 'success');
      addLog(`Parsed ${orderData.length} order records`, 'success');

      // Detect system type
      const commissionHeaders = commissionData.length > 0 ? Object.keys(commissionData[0]) : [];
      const orderHeaders = orderData.length > 0 ? Object.keys(orderData[0]) : [];
      
      const systemType = detectSystemType(commissionHeaders, orderHeaders);
      setDetectedSystem(systemType);
      
      const systemName = systemPatterns[systemType]?.name || 'Generic System';
      addLog(`Detected system: ${systemName}`, 'success');

      // Get system-specific field mapper
      const fieldMapper = getFieldMapper(systemType);

      // Filter valid records
      const validCommissions = commissionData.filter(row => {
        const customer = fieldMapper.customer(row);
        return customer && customer.trim() !== '' && customer !== '(adjustment)' && 
               customer.toLowerCase() !== 'customer' && customer.toLowerCase() !== 'n/a';
      });

      const validOrders = orderData.filter(row => {
        const customer = fieldMapper.customer(row);
        return customer && customer.trim() !== '' && customer !== '(adjustment)' && 
               customer.toLowerCase() !== 'customer' && customer.toLowerCase() !== 'n/a';
      });

      addLog(`Filtered to ${validCommissions.length} valid commission records`, 'info');
      addLog(`Filtered to ${validOrders.length} valid order records`, 'info');

      setStep(3);
      addLog('Starting cross-reference analysis and data merging...', 'info');

      // Create cross-referenced combined data
      const crossReferencedData = createCrossReferencedData(validCommissions, validOrders, fieldMapper);
      addLog(`Cross-referenced ${crossReferencedData.size} unique customer-account combinations`, 'success');

      setStep(4);
      addLog('Generating templates with available fields...', 'info');

      // Convert cross-referenced data to arrays for template generation
      const crossReferencedArray = Array.from(crossReferencedData.values());

      // Generate dynamic templates using available fields
      const generateTemplate = (templateType) => {
        return crossReferencedArray.map((record, index) => {
          const combined = record.combinedData;
          const template = {};
          
          // Get enabled fields for this template type
          const enabledFields = templateConfig[templateType] ? 
            Object.entries(templateConfig[templateType].fields)
              .filter(([field, config]) => config.selected)
              .map(([field, config]) => ({
                templateField: field,
                sourceField: config.mappedTo || field
              })) : [];
          
          // If no fields configured, use all available fields
          if (enabledFields.length === 0) {
            Object.keys(combined).forEach(field => {
              template[field] = combined[field] || '';
            });
          } else {
            enabledFields.forEach(({ templateField, sourceField }) => {
              template[templateField] = combined[sourceField] || '';
            });
          }
          
          return template;
        });
      };

      // Generate all templates
      const customers = generateTemplate('customer');
      const locations = generateTemplate('location');
      const orders = generateTemplate('order');
      const contracts = generateTemplate('contract');

      addLog('Template generation completed', 'success');

      setStep(5);
      setResults({
        customers: customers.sort((a, b) => {
          const nameA = Object.values(a)[0] || '';
          const nameB = Object.values(b)[0] || '';
          return nameA.toString().localeCompare(nameB.toString());
        }),
        locations: locations.sort((a, b) => {
          const nameA = Object.values(a)[0] || '';
          const nameB = Object.values(b)[0] || '';
          return nameA.toString().localeCompare(nameB.toString());
        }),
        orders: orders.sort((a, b) => {
          const nameA = Object.values(a)[0] || '';
          const nameB = Object.values(b)[0] || '';
          return nameA.toString().localeCompare(nameB.toString());
        }),
        contracts: contracts.sort((a, b) => {
          const nameA = Object.values(a)[0] || '';
          const nameB = Object.values(b)[0] || '';
          return nameA.toString().localeCompare(nameB.toString());
        }),
        systemType,
        crossReferencedData,
        stats: {
          totalCustomers: customers.length,
          totalLocations: locations.length,
          totalOrders: orders.length,
          totalContracts: contracts.length,
          commissionFields: commissionHeaders.length,
          orderFields: orderHeaders.length,
          totalRevenue: crossReferencedArray.reduce((sum, record) => {
            return sum + record.commissionData.reduce((commSum, comm) => 
              commSum + (fieldMapper.revenue(comm) || 0), 0);
          }, 0),
          totalCommissions: crossReferencedArray.reduce((sum, record) => {
            return sum + record.commissionData.reduce((commSum, comm) => 
              commSum + (fieldMapper.commission(comm) || 0), 0);
          }, 0)
        }
      });

      addLog(`Processing complete! Generated ${customers.length} customers, ${locations.length} locations, ${orders.length} orders, ${contracts.length} contracts`, 'success');

    } catch (error) {
      console.error('Processing error:', error);
      addLog(`Error: ${error.message}`, 'error');
      alert('Error processing files: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }, [files, parseCSV, detectSystemType, getFieldMapper, createCrossReferencedData, templateConfig, addLog]);

  // CSV export functionality
  const exportToCSV = useCallback((data, filename, templateType) => {
    if (!data || data.length === 0) return;
    
    const selectedFields = templateConfig[templateType] ? 
      Object.entries(templateConfig[templateType].fields)
        .filter(([field, config]) => config.selected)
        .map(([field, config]) => ({
          templateField: field,
          mappedField: config.mappedTo || field
        })) :
      Object.keys(data[0]).map(field => ({
        templateField: field,
        mappedField: field
      }));
    
    if (selectedFields.length === 0) {
      // If no fields configured, export all available fields
      const allFields = Object.keys(data[0]);
      const headerRow = allFields;
      let csvContent = headerRow.join(',') + '\n';
      
      data.forEach(row => {
        const values = allFields.map(field => {
          const value = row[field] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csvContent += values.join(',') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addLog(`Exported ${data.length} ${templateType} records with all available fields`, 'success');
      return;
    }
    
    const headerRow = selectedFields.map(field => field.templateField);
    let csvContent = headerRow.join(',') + '\n';
    
    data.forEach(row => {
      const values = selectedFields.map(field => {
        const value = row[field.templateField] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvContent += values.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addLog(`Exported ${data.length} ${templateType} records with ${selectedFields.length} fields`, 'success');
  }, [templateConfig, addLog]);

  // Reset functionality
  const resetApplication = () => {
    setFiles({ commissions: null, orders: null });
    setResults(null);
    setDetectedSystem(null);
    setProcessingLog([]);
    setShowTemplateConfig(false);
    setStep(1);
    setFileFields({ commissions: [], orders: [] });
    setAvailableFields([]);
    setTemplateConfig({
      customer: { enabled: true, fields: {} },
      location: { enabled: true, fields: {} },
      order: { enabled: true, fields: {} },
      contract: { enabled: true, fields: {} }
    });
    setExpandedTemplates({
      customer: false,
      location: false,
      order: false,
      contract: false
    });
  };

  // Get current template definitions
  const templateDefinitions = getTemplateDefinitions();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Database className="mr-3" size={32} />
                Dynamic Enterprise Data Mapping Platform
              </h1>
              <p className="text-gray-600">
                Universal commission & order data processing with dynamic field mapping based on your uploaded files
              </p>
            </div>
            {detectedSystem && (
              <div className={`${getSystemColorClasses(detectedSystem).bg} ${getSystemColorClasses(detectedSystem).border} rounded-lg p-4`}>
                <div className="flex items-center">
                  <Zap className={`${getSystemColorClasses(detectedSystem).text} mr-2`} size={20} />
                  <div>
                    <div className="font-semibold text-gray-900">System Detected</div>
                    <div className={`${getSystemColorClasses(detectedSystem).text} font-medium`}>
                      {systemPatterns[detectedSystem]?.name || 'Unknown System'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Supported Systems */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="mr-2" size={20} />
            Supported Systems
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(systemPatterns).map(([key, config]) => (
              <div key={key} className={`${config.colorClasses.bg} ${config.colorClasses.border} rounded-lg p-3 text-center`}>
                <div className={`${config.colorClasses.text} font-medium text-sm`}>
                  {config.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {[
              { step: 1, title: 'Upload Files', icon: Upload },
              { step: 2, title: 'Detect System', icon: Zap },
              { step: 3, title: 'Cross-Reference', icon: Database },
              { step: 4, title: 'Generate Templates', icon: FileText },
              { step: 5, title: 'Download Results', icon: Download }
            ].map(({ step: stepNum, title, icon: Icon }) => (
              <div key={stepNum} className="flex items-center">
                <div className={`rounded-full p-3 ${
                  step >= stepNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`ml-2 ${
                  step >= stepNum ? 'text-blue-600 font-semibold' : 'text-gray-400'
                }`}>
                  {title}
                </span>
                {stepNum < 5 && (
                  <div className={`w-12 h-1 mx-4 ${
                    step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Template Configuration Modal */}
        {showTemplateConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl min-h-[90vh] max-h-[95vh] flex flex-col my-8">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Configure Export Templates</h2>
                  <button
                    onClick={() => setShowTemplateConfig(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Select which templates to export and customize the fields for each template. All fields from your uploaded files are available for mapping.
                </p>
                
                {/* File Fields Display */}
                {(fileFields.commissions.length > 0 || fileFields.orders.length > 0) && (
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {fileFields.commissions.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <FileText className="mr-2" size={16} />
                          Commission File Fields ({fileFields.commissions.length})
                        </h4>
                        <div className="max-h-32 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {fileFields.commissions.map((field, idx) => (
                              <div key={idx} className="text-blue-700 bg-white px-2 py-1 rounded border border-blue-200">
                                {field}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {fileFields.orders.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                          <ShoppingCart className="mr-2" size={16} />
                          Orders File Fields ({fileFields.orders.length})
                        </h4>
                        <div className="max-h-32 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {fileFields.orders.map((field, idx) => (
                              <div key={idx} className="text-green-700 bg-white px-2 py-1 rounded border border-green-200">
                                {field}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {Object.entries(templateDefinitions).map(([templateType, definition]) => {
                    const Icon = definition.icon;
                    const config = templateConfig[templateType];
                    const selectedCount = config ? Object.values(config.fields).filter(f => f.selected).length : 0;
                    const isExpanded = expandedTemplates[templateType];
                    const colorClasses = getTemplateColorClasses(definition.color);
                    
                    return (
                      <div key={templateType} className="border border-gray-200 rounded-lg">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={config?.enabled || false}
                                onChange={() => toggleTemplateEnabled(templateType)}
                                className="mr-3"
                              />
                              <Icon className={`${colorClasses.text} mr-2`} size={20} />
                              <h3 className="font-semibold text-lg">{definition.name}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${colorClasses.bg} ${colorClasses.text}`}>
                                {selectedCount} of {definition.fields.length} fields selected
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {config?.enabled && (
                                <>
                                  <button
                                    onClick={() => {
                                      setTemplateConfig(prev => {
                                        const cfg = { ...prev };
                                        const tpl = { ...cfg[templateType] };
                                        const fields = { ...tpl.fields };

                                        definition.fields.forEach(name => {
                                          fields[name] = {
                                            ...fields[name],
                                            selected: true,
                                            required: false,
                                            mappedTo: name
                                          };
                                        });

                                        tpl.fields = fields;
                                        cfg[templateType] = tpl;
                                        return cfg;
                                      });
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    Select All
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTemplateConfig(prev => {
                                        const cfg = { ...prev };
                                        const tpl = { ...cfg[templateType] };
                                        const fields = { ...tpl.fields };

                                        definition.fields.forEach(name => {
                                          fields[name] = {
                                            ...fields[name],
                                            selected: definition.defaultSelected.includes(name),
                                            required: false,
                                            mappedTo: name
                                          };
                                        });

                                        tpl.fields = fields;
                                        cfg[templateType] = tpl;
                                        return cfg;
                                      });
                                    }}
                                    className="text-sm text-green-600 hover:text-green-800"
                                  >
                                    Reset to Default
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => toggleTemplateExpanded(templateType)}
                                className="text-gray-500 hover:text-gray-700 p-1"
                              >
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {config?.enabled && isExpanded && (
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {definition.fields.map(field => {
                                const fieldConfig = config.fields[field];
                                
                                return (
                                  <div key={field} className={`border rounded-lg p-3 ${
                                    fieldConfig?.selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                                  }`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={fieldConfig?.selected || false}
                                          onChange={() => toggleFieldSelected(templateType, field)}
                                          className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-900">
                                          {field}
                                        </span>
                                      </label>
                                    </div>
                                    
                                    {fieldConfig?.selected && (
                                      <div className="mt-2 text-xs text-gray-600">
                                        <div className="mb-1">
                                          {field.startsWith('commission_') && (
                                            <span className="text-blue-600">● Commission Field (Prefixed)</span>
                                          )}
                                          {field.startsWith('order_') && (
                                            <span className="text-green-600">● Order Field (Prefixed)</span>
                                          )}
                                          {!field.startsWith('commission_') && !field.startsWith('order_') && fileFields.commissions.includes(field) && (
                                            <span className="text-blue-600">● Commission Field</span>
                                          )}
                                          {!field.startsWith('commission_') && !field.startsWith('order_') && fileFields.orders.includes(field) && (
                                            <span className="text-green-600">● Order Field</span>
                                          )}
                                          {!field.startsWith('commission_') && !field.startsWith('order_') && 
                                           !fileFields.commissions.includes(field) && !fileFields.orders.includes(field) && (
                                            <span className="text-purple-600">● Cross-Reference Field</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="text-blue-600">● Commission fields</span> | <span className="text-green-600">● Order fields</span> | <span className="text-purple-600">● Cross-reference fields</span>
                    <br />
                    All fields from your uploaded files are available for template mapping. Prefixed fields enable cross-file data combination.
                  </div>
                  <div className="space-x-3">
                    <button
                      onClick={() => setShowTemplateConfig(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateConfig(false);
                        addLog('Template configuration updated with dynamic field mapping', 'success');
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Apply Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="mr-2" size={20} />
                  Commission File
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload('commissions', e)}
                    className="hidden"
                    id="commissions-upload"
                  />
                  <label htmlFor="commissions-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-gray-400" size={48} />
                    <p className="text-gray-600">
                      {files.commissions ? files.commissions.name : 'Upload Commission CSV'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports: Windstream, AppDirect, IBS, Intelisys, Sandler, Avant
                    </p>
                  </label>
                </div>
                {files.commissions && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    File uploaded successfully ({fileFields.commissions.length} fields detected)
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <ShoppingCart className="mr-2" size={20} />
                  Orders File
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload('orders', e)}
                    className="hidden"
                    id="orders-upload"
                  />
                  <label htmlFor="orders-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-gray-400" size={48} />
                    <p className="text-gray-600">
                      {files.orders ? files.orders.name : 'Upload Orders CSV'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Auto-detects system format and applies cross-file mapping
                    </p>
                  </label>
                </div>
                {files.orders && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    File uploaded successfully ({fileFields.orders.length} fields detected)
                  </div>
                )}
              </div>
            </div>
            
            {/* System Detection Display */}
            {detectedSystem && files.commissions && files.orders && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Zap className="mr-2 text-yellow-500" size={20} />
                      System Detected & Dynamic Field Mapping Active
                    </h3>
                    <p className="text-gray-600">
                      The system has automatically detected your data format and is ready to apply dynamic field mapping using all available fields from your files.
                    </p>
                  </div>
                  <div className={`${getSystemColorClasses(detectedSystem).bg} ${getSystemColorClasses(detectedSystem).border} rounded-lg p-4`}>
                    <div className="flex items-center">
                      <Globe className={`${getSystemColorClasses(detectedSystem).text} mr-2`} size={20} />
                      <div>
                        <div className="font-semibold text-gray-900">Detected System</div>
                        <div className={`${getSystemColorClasses(detectedSystem).text} font-medium`}>
                          {systemPatterns[detectedSystem]?.name || 'Generic System'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Dynamic Field Information */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Available Fields for Template Mapping:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-blue-600 mb-1">Commission File Fields ({fileFields.commissions.length}):</div>
                      <div className="max-h-24 overflow-y-auto text-xs space-y-1">
                        {fileFields.commissions.slice(0, 10).map((field, idx) => (
                          <div key={idx} className="text-gray-700">• {field}</div>
                        ))}
                        {fileFields.commissions.length > 10 && (
                          <div className="text-gray-500">... and {fileFields.commissions.length - 10} more</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600 mb-1">Orders File Fields ({fileFields.orders.length}):</div>
                      <div className="max-h-24 overflow-y-auto text-xs space-y-1">
                        {fileFields.orders.slice(0, 10).map((field, idx) => (
                          <div key={idx} className="text-gray-700">• {field}</div>
                        ))}
                        {fileFields.orders.length > 10 && (
                          <div className="text-gray-500">... and {fileFields.orders.length - 10} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-sm text-blue-800">
                      <strong>Dynamic Mapping:</strong> Templates will be generated using all available fields from your files. You can select which fields to include in each template during configuration.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Button */}
        {files.commissions && files.orders && step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Process</h3>
                <p className="text-gray-600">
                  {detectedSystem ? 
                    `${systemPatterns[detectedSystem]?.name} system detected. Dynamic field mapping and template generation ready.` :
                    'The system will automatically detect your data format, cross-reference commission and order data, and generate templates with all available fields.'
                  }
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    initializeTemplateConfig();
                    setShowTemplateConfig(true);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Settings className="mr-2" size={16} />
                  Configure Templates
                </button>
                <button
                  onClick={processFiles}
                  disabled={processing}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileCheck className="mr-2" size={20} />
                      Process Files
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Template Configuration Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Export Configuration:</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                {Object.entries(templateDefinitions).map(([templateType, definition]) => {
                  const config = templateConfig[templateType];
                  const selectedCount = config ? Object.values(config.fields).filter(f => f.selected).length : 0;
                  const Icon = definition.icon;
                  
                  return (
                    <div key={templateType} className={`flex items-center ${
                      config?.enabled ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      <Icon size={16} className="mr-2" />
                      <span>
                        {definition.name}: {config?.enabled ? `${selectedCount} fields` : 'Disabled'}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* File Status Display */}
              {(files.commissions || files.orders) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="font-medium text-gray-700 mb-2">Uploaded Files & Available Fields:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    {files.commissions && (
                      <div className="flex items-center text-blue-600">
                        <FileText size={12} className="mr-1" />
                        <span>Commission: {files.commissions.name} ({fileFields.commissions.length} fields)</span>
                      </div>
                    )}
                    {files.orders && (
                      <div className="flex items-center text-green-600">
                        <ShoppingCart size={12} className="mr-1" />
                        <span>Orders: {files.orders.name} ({fileFields.orders.length} fields)</span>
                      </div>
                    )}
                    {detectedSystem && (
                      <div className={`flex items-center ${getSystemColorClasses(detectedSystem).text}`}>
                        <Zap size={12} className="mr-1" />
                        <span>System: {systemPatterns[detectedSystem]?.name} (Auto-detected)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Log */}
        {processingLog.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Processing Log</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="space-y-2 font-mono text-sm">
                {processingLog.map((log, index) => (
                  <div key={index} className={`flex items-center ${
                    log.type === 'error' ? 'text-red-600' : 
                    log.type === 'success' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    <span className="text-gray-400 mr-2">[{log.timestamp}]</span>
                    {log.type === 'error' && <AlertCircle size={16} className="mr-1" />}
                    {log.type === 'success' && <CheckCircle size={16} className="mr-1" />}
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && step === 5 && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Processing Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.stats.totalCustomers}</div>
                  <div className="text-sm text-gray-600">Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.stats.totalLocations}</div>
                  <div className="text-sm text-gray-600">Locations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{results.stats.totalOrders}</div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{results.stats.totalContracts}</div>
                  <div className="text-sm text-gray-600">Contracts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.stats.commissionFields}</div>
                  <div className="text-sm text-gray-600">Commission Fields</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{results.stats.orderFields}</div>
                  <div className="text-sm text-gray-600">Order Fields</div>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Export Templates</h3>
                <button
                  onClick={() => setShowTemplateConfig(true)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                >
                  <Settings className="mr-2" size={16} />
                  Configure Fields
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(templateDefinitions).map(([templateType, definition]) => {
                  const config = templateConfig[templateType];
                  const selectedCount = config ? Object.values(config.fields).filter(f => f.selected).length : 0;
                  const Icon = definition.icon;
                  const colorClasses = getTemplateColorClasses(definition.color);
                  const data = results[templateType === 'customer' ? 'customers' : 
                                     templateType === 'location' ? 'locations' :
                                     templateType === 'order' ? 'orders' : 'contracts'];
                  
                  return (
                    <button
                      key={templateType}
                      onClick={() => {
                        exportToCSV(data, `${systemPatterns[results.systemType]?.name || 'Generic'}_${templateType}_template.csv`, templateType);
                      }}
                      disabled={!config?.enabled}
                      className={`p-4 rounded-lg flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        config?.enabled 
                          ? `${colorClasses.button} text-white` 
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Icon className="mb-2" size={20} />
                      <span className="font-medium">{definition.name}</span>
                      <span className="text-sm opacity-90">
                        {config?.enabled ? `${selectedCount || 'All'} fields` : 'Disabled'} • {data?.length || 0} records
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Tables */}
            <div className="space-y-6">
              {Object.entries(templateDefinitions).map(([templateType, definition]) => {
                const config = templateConfig[templateType];
                if (!config?.enabled) return null;
                
                const data = results[templateType === 'customer' ? 'customers' : 
                                   templateType === 'location' ? 'locations' :
                                   templateType === 'order' ? 'orders' : 'contracts'];
                
                const selectedFields = Object.entries(config.fields)
                  .filter(([field, fieldConfig]) => fieldConfig.selected)
                  .map(([field]) => field)
                  .slice(0, 6); // Show first 6 selected fields in preview
                
                // If no fields are selected, show first 6 available fields from the data
                const fieldsToShow = selectedFields.length > 0 ? selectedFields : Object.keys(data[0] || {}).slice(0, 6);
                
                const Icon = definition.icon;
                const colorClasses = getTemplateColorClasses(definition.color);
                
                return (
                  <div key={templateType} className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${colorClasses.text}`}>
                      <Icon className="mr-2" size={20} />
                      {definition.name} Preview
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Showing {fieldsToShow.length} of {Object.keys(data[0] || {}).length} available fields)
                      </span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            {fieldsToShow.map(field => (
                              <th key={field} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                {field}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.slice(0, 3).map((row, index) => (
                            <tr key={index} className="border-t">
                              {fieldsToShow.map((field, colIndex) => (
                                <td key={colIndex} className="px-4 py-2 text-sm text-gray-900">
                                  {String(row[field] || '').length > 30 ? String(row[field] || '').substring(0, 30) + '...' : String(row[field] || '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Showing first 3 rows with {selectedFields.length > 0 ? 'selected' : 'available'} fields. Download full CSV for complete data with all {Object.keys(data[0] || {}).length} fields from your uploaded files.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <button
              onClick={resetApplication}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
            >
              Process New Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseDataMappingApp;