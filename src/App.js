import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, Users, MapPin, ShoppingCart, FileCheck, AlertCircle, CheckCircle, Globe, Zap, Database, Settings, ArrowRight, X } from 'lucide-react';

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
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateMappings, setTemplateMappings] = useState({});
  const [fileFields, setFileFields] = useState({
    commissions: [],
    orders: []
  });
  const [enabledTemplates, setEnabledTemplates] = useState({
    customer: true,
    location: true,
    order: true,
    contract: true
  });
  const [customTemplateRequirements, setCustomTemplateRequirements] = useState(null);
  
  // Template editor form state
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldDescription, setNewFieldDescription] = useState('');
  const [newFieldType, setNewFieldType] = useState('optional');
  const [editingField, setEditingField] = useState(null);
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldDescription, setEditFieldDescription] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Default template field requirements - what each template actually needs
  const defaultTemplateRequirements = {
    customer: {
      name: 'Customer Template',
      icon: Users,
      color: 'blue',
      description: 'Customer master data for CRM and billing systems',
      required: [
        { field: 'CustomerID', description: 'Unique customer identifier' },
        { field: 'CustomerName', description: 'Full customer name or company' },
        { field: 'AccountNumber', description: 'Account/billing number' }
      ],
      optional: [
        { field: 'Address', description: 'Customer address' },
        { field: 'City', description: 'Customer city' },
        { field: 'State', description: 'Customer state/province' },
        { field: 'ZIP', description: 'Postal/ZIP code' },
        { field: 'Phone', description: 'Primary phone number' },
        { field: 'Email', description: 'Primary email address' },
        { field: 'Industry', description: 'Customer industry/vertical' },
        { field: 'Territory', description: 'Sales territory' },
        { field: 'Rep', description: 'Sales representative' },
        { field: 'Status', description: 'Customer status' }
      ]
    },
    location: {
      name: 'Location Template',
      icon: MapPin,
      color: 'green',
      description: 'Service location and installation data',
      required: [
        { field: 'LocationID', description: 'Unique location identifier' },
        { field: 'CustomerID', description: 'Associated customer ID' },
        { field: 'ServiceAddress', description: 'Service installation address' }
      ],
      optional: [
        { field: 'LocationName', description: 'Location name/description' },
        { field: 'City', description: 'Service city' },
        { field: 'State', description: 'Service state/province' },
        { field: 'ZIP', description: 'Service postal code' },
        { field: 'Country', description: 'Service country' },
        { field: 'TimeZone', description: 'Location time zone' },
        { field: 'ServiceType', description: 'Type of service provided' },
        { field: 'InstallDate', description: 'Installation date' },
        { field: 'Coordinates', description: 'GPS coordinates' },
        { field: 'AccessNotes', description: 'Installation access notes' }
      ]
    },
    order: {
      name: 'Order Template',
      icon: ShoppingCart,
      color: 'purple',
      description: 'Order processing and fulfillment data',
      required: [
        { field: 'OrderID', description: 'Unique order identifier' },
        { field: 'CustomerID', description: 'Associated customer ID' },
        { field: 'OrderDate', description: 'Order placement date' }
      ],
      optional: [
        { field: 'Product', description: 'Product or service ordered' },
        { field: 'Quantity', description: 'Order quantity' },
        { field: 'UnitPrice', description: 'Price per unit' },
        { field: 'TotalAmount', description: 'Total order amount' },
        { field: 'MRC', description: 'Monthly recurring charge' },
        { field: 'NRC', description: 'Non-recurring charge' },
        { field: 'Status', description: 'Order status' },
        { field: 'Rep', description: 'Sales representative' },
        { field: 'Commission', description: 'Commission amount' },
        { field: 'Provider', description: 'Service provider' },
        { field: 'Terms', description: 'Contract terms' }
      ]
    },
    contract: {
      name: 'Contract Template',
      icon: FileText,
      color: 'orange',
      description: 'Contract and agreement management data',
      required: [
        { field: 'ContractID', description: 'Unique contract identifier' },
        { field: 'CustomerID', description: 'Associated customer ID' },
        { field: 'StartDate', description: 'Contract start date' }
      ],
      optional: [
        { field: 'EndDate', description: 'Contract end date' },
        { field: 'Terms', description: 'Contract term length' },
        { field: 'MRC', description: 'Monthly recurring revenue' },
        { field: 'TotalValue', description: 'Total contract value' },
        { field: 'AutoRenewal', description: 'Auto-renewal terms' },
        { field: 'PenaltyClause', description: 'Early termination penalty' },
        { field: 'ServiceLevel', description: 'Service level agreement' },
        { field: 'BillingCycle', description: 'Billing frequency' },
        { field: 'PaymentTerms', description: 'Payment terms' },
        { field: 'Rep', description: 'Account representative' },
        { field: 'Commission', description: 'Commission structure' }
      ]
    }
  };

  // Get current template requirements (custom or default)
  const templateRequirements = customTemplateRequirements || defaultTemplateRequirements;

  // Template editor functions
  const openTemplateEditor = useCallback((templateType) => {
    setEditingTemplate(templateType);
    const template = (customTemplateRequirements || defaultTemplateRequirements)[templateType];
    setTemplateName(template?.name || '');
    setTemplateDescription(template?.description || '');
    setNewFieldName('');
    setNewFieldDescription('');
    setNewFieldType('optional');
    setEditingField(null);
    setShowTemplateEditor(true);
  }, [customTemplateRequirements, defaultTemplateRequirements]);

  const addTemplateField = useCallback((templateType, fieldType, fieldName, description) => {
    if (!fieldName.trim()) return;
    
    setCustomTemplateRequirements(prev => {
      const current = prev || { ...defaultTemplateRequirements };
      const template = { ...current[templateType] };
      const targetArray = fieldType === 'required' ? template.required : template.optional;
      
      // Check if field already exists
      const existsInRequired = template.required.some(f => f.field === fieldName);
      const existsInOptional = template.optional.some(f => f.field === fieldName);
      
      if (existsInRequired || existsInOptional) {
        alert('Field already exists in this template');
        return prev;
      }
      
      const newField = { field: fieldName, description: description || `${fieldName} field` };
      
      return {
        ...current,
        [templateType]: {
          ...template,
          [fieldType]: [...targetArray, newField]
        }
      };
    });
  }, [defaultTemplateRequirements]);

  const removeTemplateField = useCallback((templateType, fieldType, fieldName) => {
    setCustomTemplateRequirements(prev => {
      const current = prev || { ...defaultTemplateRequirements };
      const template = { ...current[templateType] };
      
      return {
        ...current,
        [templateType]: {
          ...template,
          [fieldType]: template[fieldType].filter(f => f.field !== fieldName)
        }
      };
    });
  }, [defaultTemplateRequirements]);

  const updateTemplateField = useCallback((templateType, fieldType, oldFieldName, newFieldName, newDescription) => {
    setCustomTemplateRequirements(prev => {
      const current = prev || { ...defaultTemplateRequirements };
      const template = { ...current[templateType] };
      
      return {
        ...current,
        [templateType]: {
          ...template,
          [fieldType]: template[fieldType].map(f => 
            f.field === oldFieldName 
              ? { field: newFieldName, description: newDescription }
              : f
          )
        }
      };
    });
  }, [defaultTemplateRequirements]);

  const moveFieldBetweenTypes = useCallback((templateType, fieldName, fromType, toType) => {
    setCustomTemplateRequirements(prev => {
      const current = prev || { ...defaultTemplateRequirements };
      const template = { ...current[templateType] };
      
      const field = template[fromType].find(f => f.field === fieldName);
      if (!field) return prev;
      
      return {
        ...current,
        [templateType]: {
          ...template,
          [fromType]: template[fromType].filter(f => f.field !== fieldName),
          [toType]: [...template[toType], field]
        }
      };
    });
  }, [defaultTemplateRequirements]);

  const resetTemplateToDefault = useCallback((templateType) => {
    setCustomTemplateRequirements(prev => {
      const current = prev || { ...defaultTemplateRequirements };
      
      return {
        ...current,
        [templateType]: { ...defaultTemplateRequirements[templateType] }
      };
    });
  }, [defaultTemplateRequirements]);

  const updateTemplateInfo = useCallback((templateType, name, description) => {
    setCustomTemplateRequirements(prev => {
      const current = prev || { ...defaultTemplateRequirements };
      
      return {
        ...current,
        [templateType]: {
          ...current[templateType],
          name: name,
          description: description
        }
      };
    });
  }, [defaultTemplateRequirements]);

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

  // Auto-mapping logic based on field name similarity
  const getAutoMappingSuggestions = useCallback((templateField, availableFields) => {
    const suggestions = [];
    const fieldLower = templateField.toLowerCase();
    
    // Direct matches
    availableFields.forEach(sourceField => {
      const sourceLower = sourceField.toLowerCase();
      if (sourceLower === fieldLower) {
        suggestions.push({ field: sourceField, confidence: 100, reason: 'Exact match' });
      } else if (sourceLower.includes(fieldLower) || fieldLower.includes(sourceLower)) {
        suggestions.push({ field: sourceField, confidence: 80, reason: 'Partial match' });
      }
    });

    // Pattern-based matches
    const patterns = {
      'customerid': ['customer', 'cust', 'client', 'account'],
      'customername': ['custfname', 'custlname', 'customer name', 'client name'],
      'accountnumber': ['account', 'acct', 'accountnbr', 'account number'],
      'orderid': ['order', 'order id', 'order number', 'rpm order'],
      'orderdate': ['date', 'order date', 'commission date', 'commdate'],
      'rep': ['rep', 'sales', 'seller', 'advisor', 'agent'],
      'commission': ['commission', 'comm', 'comp paid', 'sales comm'],
      'mrc': ['mrc', 'monthly', 'recurring', 'net billed'],
      'product': ['product', 'service', 'provider', 'supplier'],
      'address': ['address', 'addr', 'location'],
      'phone': ['phone', 'tel', 'telephone'],
      'email': ['email', 'mail']
    };

    const fieldPatterns = patterns[fieldLower] || [];
    availableFields.forEach(sourceField => {
      const sourceLower = sourceField.toLowerCase();
      fieldPatterns.forEach(pattern => {
        if (sourceLower.includes(pattern) && !suggestions.some(s => s.field === sourceField)) {
          suggestions.push({ field: sourceField, confidence: 60, reason: `Pattern match: ${pattern}` });
        }
      });
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }, []);

  // Initialize template mappings with auto-suggestions
  const initializeTemplateMappings = useCallback(() => {
    const allFields = [...fileFields.commissions, ...fileFields.orders];
    const mappings = {};
    
    Object.keys(templateRequirements).forEach(templateType => {
      mappings[templateType] = {};
      const template = templateRequirements[templateType];
      
      [...template.required, ...template.optional].forEach(fieldDef => {
        const suggestions = getAutoMappingSuggestions(fieldDef.field, allFields);
        mappings[templateType][fieldDef.field] = {
          sourceField: suggestions.length > 0 ? suggestions[0].field : '',
          sourceFile: '',
          suggestions: suggestions,
          enabled: template.required.some(req => req.field === fieldDef.field) // Enable required fields by default
        };
        
        // Set source file if we have a mapping
        if (suggestions.length > 0) {
          const sourceField = suggestions[0].field;
          if (fileFields.commissions.includes(sourceField)) {
            mappings[templateType][fieldDef.field].sourceFile = 'commissions';
          } else if (fileFields.orders.includes(sourceField)) {
            mappings[templateType][fieldDef.field].sourceFile = 'orders';
          }
        }
      });
    });
    
    setTemplateMappings(mappings);
  }, [fileFields, getAutoMappingSuggestions]);

  // System detection logic
  const detectSystemType = useCallback((commissionHeaders, orderHeaders) => {
    let bestMatch = { system: 'GENERIC', score: 0 };
    
    for (const [systemKey, config] of Object.entries(systemPatterns)) {
      let score = 0;
      let totalFields = config.commissionFields.length + config.orderFields.length;
      
      const commissionMatches = config.commissionFields.filter(field => 
        commissionHeaders.some(header => header.toLowerCase().includes(field.toLowerCase()))
      ).length;
      
      const orderMatches = config.orderFields.filter(field => 
        orderHeaders.some(header => header.toLowerCase().includes(field.toLowerCase()))
      ).length;
      
      score = (commissionMatches + orderMatches) / totalFields;
      
      if (score >= 0.5 && (commissionMatches + orderMatches) >= 2 && score > bestMatch.score) {
        bestMatch = { system: systemKey, score };
      }
    }
    
    return bestMatch.system;
  }, []);

  // File handling with field analysis and system detection
  const handleFileUpload = useCallback(async (fileType, event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setFiles(prev => ({ ...prev, [fileType]: file }));
      addLog(`Uploaded ${fileType} file: ${file.name}`, 'success');
      
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
            
            const updatedFiles = fileType === 'commissions' ? 
              { ...files, commissions: file } : 
              { ...files, orders: file };
            
            if (updatedFiles.commissions && updatedFiles.orders && newFileFields.commissions.length > 0 && newFileFields.orders.length > 0) {
              const commissionHeaders = fileType === 'commissions' ? headers : newFileFields.commissions;
              const orderHeaders = fileType === 'orders' ? headers : newFileFields.orders;
              
              const systemType = detectSystemType(commissionHeaders, orderHeaders);
              setDetectedSystem(systemType);
              
              const systemName = systemPatterns[systemType]?.name || 'Generic System';
              addLog(`System detected: ${systemName} - Template mapping suggestions generated`, 'success');
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

  // Cross-reference data merging
  const createCrossReferencedData = useCallback((commissions, orders) => {
    const crossReferencedData = new Map();
    
    // Helper function to extract customer identifier
    const getCustomerKey = (record, isCommission = true) => {
      let customer = '';
      let account = '';
      
      if (isCommission) {
        // Try common commission customer fields
        customer = record['Customer'] || record['CUSTFNAME'] + ' ' + record['CUSTLNAME'] || 
                  record['Customer Name'] || record['Provider Customer Name'] || '';
        account = record['ACCOUNTNBR'] || record['Account Number'] || record['Account'] || 
                 record['Provider Account #'] || '';
      } else {
        // Try common order customer fields
        customer = record['Customer Name'] || record['Customer'] || record['Provider Customer Name'] || 
                  record['Client Name'] || '';
        account = record['Account Number'] || record['Number'] || record['Order ID'] || 
                 record['RPM Order'] || record['Sandler Order #'] || '';
      }
      
      return `${customer.trim()}|${account.trim() || 'default'}`;
    };
    
    // Index commission data
    commissions.forEach(commissionRow => {
      const key = getCustomerKey(commissionRow, true);
      
      if (!crossReferencedData.has(key)) {
        crossReferencedData.set(key, {
          commissionData: [],
          orderData: [],
          combinedData: {}
        });
      }
      
      crossReferencedData.get(key).commissionData.push(commissionRow);
      // Store commission data with prefix
      Object.entries(commissionRow).forEach(([field, value]) => {
        crossReferencedData.get(key).combinedData[field] = value;
        crossReferencedData.get(key).combinedData[`commission_${field}`] = value;
      });
    });
    
    // Match and merge order data
    orders.forEach(orderRow => {
      const key = getCustomerKey(orderRow, false);
      
      if (!crossReferencedData.has(key)) {
        crossReferencedData.set(key, {
          commissionData: [],
          orderData: [],
          combinedData: {}
        });
      }
      
      crossReferencedData.get(key).orderData.push(orderRow);
      // Store order data with prefix, don't overwrite existing commission data
      Object.entries(orderRow).forEach(([field, value]) => {
        if (!crossReferencedData.get(key).combinedData[field]) {
          crossReferencedData.get(key).combinedData[field] = value;
        }
        crossReferencedData.get(key).combinedData[`order_${field}`] = value;
      });
    });
    
    return crossReferencedData;
  }, []);

  // Generate template data based on mappings
  const generateTemplateData = useCallback((crossReferencedData, templateType) => {
    const mappings = templateMappings[templateType];
    if (!mappings) return [];
    
    return Array.from(crossReferencedData.values()).map((record, index) => {
      const templateRecord = {};
      
      Object.entries(mappings).forEach(([templateField, mapping]) => {
        if (mapping.enabled && mapping.sourceField) {
          const sourceField = mapping.sourceFile === 'commissions' ? 
            `commission_${mapping.sourceField}` : 
            mapping.sourceFile === 'orders' ? 
            `order_${mapping.sourceField}` : 
            mapping.sourceField;
          
          templateRecord[templateField] = record.combinedData[sourceField] || 
                                        record.combinedData[mapping.sourceField] || '';
        } else {
          templateRecord[templateField] = '';
        }
      });
      
      return templateRecord;
    });
  }, [templateMappings]);

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
      
      const commissionText = await files.commissions.text();
      const orderText = await files.orders.text();
      
      const commissionData = parseCSV(commissionText);
      const orderData = parseCSV(orderText);

      addLog(`Parsed ${commissionData.length} commission records`, 'success');
      addLog(`Parsed ${orderData.length} order records`, 'success');

      const commissionHeaders = commissionData.length > 0 ? Object.keys(commissionData[0]) : [];
      const orderHeaders = orderData.length > 0 ? Object.keys(orderData[0]) : [];
      
      const systemType = detectSystemType(commissionHeaders, orderHeaders);
      setDetectedSystem(systemType);
      
      const systemName = systemPatterns[systemType]?.name || 'Generic System';
      addLog(`Detected system: ${systemName}`, 'success');

      setStep(3);
      addLog('Starting cross-reference analysis...', 'info');

      const crossReferencedData = createCrossReferencedData(commissionData, orderData);
      addLog(`Cross-referenced ${crossReferencedData.size} unique customer records`, 'success');

      setStep(4);
      addLog('Generating templates based on field mappings...', 'info');

      const templateResults = {};
      let totalGenerated = 0;
      
      Object.keys(templateRequirements).forEach(templateType => {
        if (enabledTemplates[templateType]) {
          const templateData = generateTemplateData(crossReferencedData, templateType);
          templateResults[templateType] = templateData;
          totalGenerated += templateData.length;
          addLog(`Generated ${templateData.length} ${templateType} records`, 'success');
        }
      });

      setStep(5);
      setResults({
        templates: templateResults,
        systemType,
        crossReferencedData,
        stats: {
          totalRecords: crossReferencedData.size,
          totalGenerated,
          commissionFields: commissionHeaders.length,
          orderFields: orderHeaders.length
        }
      });

      addLog(`Processing complete! Generated ${totalGenerated} total template records`, 'success');

    } catch (error) {
      console.error('Processing error:', error);
      addLog(`Error: ${error.message}`, 'error');
      alert('Error processing files: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }, [files, parseCSV, detectSystemType, createCrossReferencedData, generateTemplateData, templateMappings, enabledTemplates, addLog]);

  // CSV export functionality
  const exportToCSV = useCallback((data, filename) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
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
    
    addLog(`Exported ${data.length} records to ${filename}`, 'success');
  }, [addLog]);

  // Reset functionality
  const resetApplication = () => {
    setFiles({ commissions: null, orders: null });
    setResults(null);
    setDetectedSystem(null);
    setProcessingLog([]);
    setShowTemplateConfig(false);
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    setNewFieldName('');
    setNewFieldDescription('');
    setNewFieldType('optional');
    setEditingField(null);
    setEditFieldName('');
    setEditFieldDescription('');
    setTemplateName('');
    setTemplateDescription('');
    setStep(1);
    setFileFields({ commissions: [], orders: [] });
    setTemplateMappings({});
    setCustomTemplateRequirements(null);
    setEnabledTemplates({
      customer: true,
      location: true,
      order: true,
      contract: true
    });
  };

  // Update template mapping
  const updateTemplateMapping = useCallback((templateType, fieldName, sourceField, sourceFile) => {
    setTemplateMappings(prev => ({
      ...prev,
      [templateType]: {
        ...prev[templateType],
        [fieldName]: {
          ...prev[templateType][fieldName],
          sourceField,
          sourceFile
        }
      }
    }));
  }, []);

  // Toggle field enabled state
  const toggleFieldEnabled = useCallback((templateType, fieldName) => {
    setTemplateMappings(prev => ({
      ...prev,
      [templateType]: {
        ...prev[templateType],
        [fieldName]: {
          ...prev[templateType][fieldName],
          enabled: !prev[templateType][fieldName].enabled
        }
      }
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Database className="mr-3" size={32} />
                Enterprise Data Mapping Platform
              </h1>
              <p className="text-gray-600">
                Map commission & order data to standardized template formats with intelligent field matching
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

        {/* Template Requirements Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="mr-2" size={20} />
            Template Requirements
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Click templates to customize requirements)
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(templateRequirements).map(([templateType, template]) => {
              const Icon = template.icon;
              const colorClasses = getTemplateColorClasses(template.color);
              
              return (
                <div 
                  key={templateType} 
                  className={`${colorClasses.bg} ${colorClasses.border} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => openTemplateEditor(templateType)}
                >
                  <div className="flex items-center mb-2">
                    <Icon className={`${colorClasses.text} mr-2`} size={20} />
                    <h4 className="font-semibold">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="text-xs space-y-1">
                    <div className="text-red-600 font-medium">
                      {template.required.length} Required Fields
                    </div>
                    <div className="text-gray-500">
                      {template.optional.length} Optional Fields
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    Click to customize →
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {[
              { step: 1, title: 'Upload Files', icon: Upload },
              { step: 2, title: 'Detect System', icon: Zap },
              { step: 3, title: 'Cross-Reference', icon: Database },
              { step: 4, title: 'Map Templates', icon: FileText },
              { step: 5, title: 'Export Templates', icon: Download }
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

        {/* Template Editor Modal */}
        {showTemplateEditor && editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl min-h-[90vh] max-h-[95vh] flex flex-col my-8">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Edit Template Requirements</h2>
                  <button
                    onClick={() => setShowTemplateEditor(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Customize the field requirements for the {templateRequirements[editingTemplate]?.name} template.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Template Info Editor */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-4 flex items-center">
                      {(() => {
                        const template = templateRequirements[editingTemplate];
                        const Icon = template?.icon;
                        const colorClasses = getTemplateColorClasses(template?.color);
                        return Icon ? <Icon className={`${colorClasses.text} mr-2`} size={20} /> : null;
                      })()}
                      Template Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template Name
                        </label>
                        <input
                          type="text"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          onBlur={() => updateTemplateInfo(editingTemplate, templateName, templateDescription)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder="Enter template name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template Description
                        </label>
                        <input
                          type="text"
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                          onBlur={() => updateTemplateInfo(editingTemplate, templateName, templateDescription)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder="Enter template description"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add New Field */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Add New Field</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder="e.g., CustomerID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={newFieldDescription}
                          onChange={(e) => setNewFieldDescription(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder="Field description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field Type
                        </label>
                        <select
                          value={newFieldType}
                          onChange={(e) => setNewFieldType(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="required">Required</option>
                          <option value="optional">Optional</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            addTemplateField(editingTemplate, newFieldType, newFieldName, newFieldDescription);
                            setNewFieldName('');
                            setNewFieldDescription('');
                          }}
                          disabled={!newFieldName.trim()}
                          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
                        >
                          Add Field
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Required Fields */}
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-red-800">
                        Required Fields ({templateRequirements[editingTemplate]?.required?.length || 0})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {templateRequirements[editingTemplate]?.required?.map((field) => (
                        <div key={field.field} className="bg-white border border-red-300 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {editingField === `required-${field.field}` ? (
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={editFieldName}
                                    onChange={(e) => setEditFieldName(e.target.value)}
                                    className="p-1 border border-gray-300 rounded text-sm"
                                    placeholder="Field name"
                                  />
                                  <input
                                    type="text"
                                    value={editFieldDescription}
                                    onChange={(e) => setEditFieldDescription(e.target.value)}
                                    className="p-1 border border-gray-300 rounded text-sm"
                                    placeholder="Description"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <div className="font-medium text-gray-900">{field.field}</div>
                                  <div className="text-sm text-gray-600">{field.description}</div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {editingField === `required-${field.field}` ? (
                                <>
                                  <button
                                    onClick={() => {
                                      updateTemplateField(editingTemplate, 'required', field.field, editFieldName, editFieldDescription);
                                      setEditingField(null);
                                    }}
                                    className="text-green-600 hover:text-green-800 text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingField(null)}
                                    className="text-gray-600 hover:text-gray-800 text-sm"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingField(`required-${field.field}`);
                                      setEditFieldName(field.field);
                                      setEditFieldDescription(field.description);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => moveFieldBetweenTypes(editingTemplate, field.field, 'required', 'optional')}
                                    className="text-orange-600 hover:text-orange-800 text-sm"
                                  >
                                    → Optional
                                  </button>
                                  <button
                                    onClick={() => removeTemplateField(editingTemplate, 'required', field.field)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Remove
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!templateRequirements[editingTemplate]?.required || templateRequirements[editingTemplate].required.length === 0) && (
                        <div className="text-gray-500 text-sm italic">No required fields defined</div>
                      )}
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">
                        Optional Fields ({templateRequirements[editingTemplate]?.optional?.length || 0})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {templateRequirements[editingTemplate]?.optional?.map((field) => (
                        <div key={field.field} className="border border-gray-300 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {editingField === `optional-${field.field}` ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={editFieldName}
                                    onChange={(e) => setEditFieldName(e.target.value)}
                                    className="w-full p-1 border border-gray-300 rounded text-sm"
                                    placeholder="Field name"
                                  />
                                  <input
                                    type="text"
                                    value={editFieldDescription}
                                    onChange={(e) => setEditFieldDescription(e.target.value)}
                                    className="w-full p-1 border border-gray-300 rounded text-sm"
                                    placeholder="Description"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">{field.field}</div>
                                  <div className="text-xs text-gray-600">{field.description}</div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-1 ml-2">
                              {editingField === `optional-${field.field}` ? (
                                <>
                                  <button
                                    onClick={() => {
                                      updateTemplateField(editingTemplate, 'optional', field.field, editFieldName, editFieldDescription);
                                      setEditingField(null);
                                    }}
                                    className="text-green-600 hover:text-green-800 text-xs"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingField(null)}
                                    className="text-gray-600 hover:text-gray-800 text-xs"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingField(`optional-${field.field}`);
                                      setEditFieldName(field.field);
                                      setEditFieldDescription(field.description);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => moveFieldBetweenTypes(editingTemplate, field.field, 'optional', 'required')}
                                    className="text-orange-600 hover:text-orange-800 text-xs"
                                  >
                                    Make Required
                                  </button>
                                  <button
                                    onClick={() => removeTemplateField(editingTemplate, 'optional', field.field)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    Remove
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!templateRequirements[editingTemplate]?.optional || templateRequirements[editingTemplate].optional.length === 0) && (
                        <div className="text-gray-500 text-sm italic col-span-2">No optional fields defined</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset this template to default requirements? This will remove all customizations.')) {
                        resetTemplateToDefault(editingTemplate);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Reset to Default
                  </button>
                  <div className="space-x-3">
                    <button
                      onClick={() => setShowTemplateEditor(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateEditor(false);
                        addLog(`Template requirements updated for ${templateRequirements[editingTemplate]?.name}`, 'success');
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Configuration Modal */}
        {showTemplateConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl min-h-[90vh] max-h-[95vh] flex flex-col my-8">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Configure Template Field Mappings</h2>
                  <button
                    onClick={() => setShowTemplateConfig(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Map fields from your uploaded files to the required template fields. Required fields are marked in red.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {Object.entries(templateRequirements).map(([templateType, template]) => {
                    const Icon = template.icon;
                    const colorClasses = getTemplateColorClasses(template.color);
                    const mappings = templateMappings[templateType] || {};
                    const mappedCount = Object.values(mappings).filter(m => m.enabled && m.sourceField).length;
                    
                    return (
                      <div key={templateType} className="border border-gray-200 rounded-lg">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={enabledTemplates[templateType]}
                                onChange={() => setEnabledTemplates(prev => ({
                                  ...prev,
                                  [templateType]: !prev[templateType]
                                }))}
                                className="mr-3"
                              />
                              <Icon className={`${colorClasses.text} mr-2`} size={20} />
                              <h3 className="font-semibold text-lg">{template.name}</h3>
                              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${colorClasses.bg} ${colorClasses.text}`}>
                                {mappedCount} of {template.required.length + template.optional.length} fields mapped
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                        </div>

                        {enabledTemplates[templateType] && (
                          <div className="p-4">
                            {/* Required Fields */}
                            <div className="mb-6">
                              <h4 className="font-semibold text-red-600 mb-3">Required Fields</h4>
                              <div className="space-y-3">
                                {template.required.map(fieldDef => {
                                  const mapping = mappings[fieldDef.field] || {};
                                  
                                  return (
                                    <div key={fieldDef.field} className="border border-red-200 rounded-lg p-3 bg-red-50">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={mapping.enabled || false}
                                            onChange={() => toggleFieldEnabled(templateType, fieldDef.field)}
                                            className="mr-2"
                                          />
                                          <label className="font-medium text-gray-900">
                                            {fieldDef.field}
                                          </label>
                                          <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                            Required
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-3">{fieldDef.description}</p>
                                      
                                      {mapping.enabled && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Source File
                                            </label>
                                            <select
                                              value={mapping.sourceFile || ''}
                                              onChange={(e) => {
                                                const file = e.target.value;
                                                setTemplateMappings(prev => ({
                                                  ...prev,
                                                  [templateType]: {
                                                    ...prev[templateType],
                                                    [fieldDef.field]: {
                                                      ...prev[templateType][fieldDef.field],
                                                      sourceFile: file,
                                                      sourceField: ''
                                                    }
                                                  }
                                                }));
                                              }}
                                              className="w-full p-2 border border-gray-300 rounded text-sm"
                                            >
                                              <option value="">Select File</option>
                                              <option value="commissions">Commission File</option>
                                              <option value="orders">Orders File</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Source Field
                                            </label>
                                            <select
                                              value={mapping.sourceField || ''}
                                              onChange={(e) => updateTemplateMapping(templateType, fieldDef.field, e.target.value, mapping.sourceFile)}
                                              className="w-full p-2 border border-gray-300 rounded text-sm"
                                              disabled={!mapping.sourceFile}
                                            >
                                              <option value="">Select Field</option>
                                              {mapping.sourceFile === 'commissions' && fileFields.commissions.map(field => (
                                                <option key={field} value={field}>{field}</option>
                                              ))}
                                              {mapping.sourceFile === 'orders' && fileFields.orders.map(field => (
                                                <option key={field} value={field}>{field}</option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {mapping.suggestions && mapping.suggestions.length > 0 && (
                                        <div className="mt-3">
                                          <p className="text-xs font-medium text-gray-700 mb-2">Suggestions:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {mapping.suggestions.map((suggestion, idx) => (
                                              <button
                                                key={idx}
                                                onClick={() => {
                                                  const sourceFile = fileFields.commissions.includes(suggestion.field) ? 'commissions' : 'orders';
                                                  updateTemplateMapping(templateType, fieldDef.field, suggestion.field, sourceFile);
                                                }}
                                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                              >
                                                {suggestion.field} ({suggestion.confidence}%)
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Optional Fields */}
                            <div>
                              <h4 className="font-semibold text-gray-600 mb-3">Optional Fields</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {template.optional.map(fieldDef => {
                                  const mapping = mappings[fieldDef.field] || {};
                                  
                                  return (
                                    <div key={fieldDef.field} className="border border-gray-200 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={mapping.enabled || false}
                                            onChange={() => toggleFieldEnabled(templateType, fieldDef.field)}
                                            className="mr-2"
                                          />
                                          <label className="font-medium text-gray-900 text-sm">
                                            {fieldDef.field}
                                          </label>
                                        </div>
                                      </div>
                                      
                                      {mapping.enabled && (
                                        <div className="space-y-2">
                                          <div className="grid grid-cols-2 gap-2">
                                            <select
                                              value={mapping.sourceFile || ''}
                                              onChange={(e) => {
                                                const file = e.target.value;
                                                setTemplateMappings(prev => ({
                                                  ...prev,
                                                  [templateType]: {
                                                    ...prev[templateType],
                                                    [fieldDef.field]: {
                                                      ...prev[templateType][fieldDef.field],
                                                      sourceFile: file,
                                                      sourceField: ''
                                                    }
                                                  }
                                                }));
                                              }}
                                              className="w-full p-1 border border-gray-300 rounded text-xs"
                                            >
                                              <option value="">File</option>
                                              <option value="commissions">Commission</option>
                                              <option value="orders">Orders</option>
                                            </select>
                                            <select
                                              value={mapping.sourceField || ''}
                                              onChange={(e) => updateTemplateMapping(templateType, fieldDef.field, e.target.value, mapping.sourceFile)}
                                              className="w-full p-1 border border-gray-300 rounded text-xs"
                                              disabled={!mapping.sourceFile}
                                            >
                                              <option value="">Field</option>
                                              {mapping.sourceFile === 'commissions' && fileFields.commissions.map(field => (
                                                <option key={field} value={field}>{field}</option>
                                              ))}
                                              {mapping.sourceFile === 'orders' && fileFields.orders.map(field => (
                                                <option key={field} value={field}>{field}</option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
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
                    Map your uploaded file fields to the required template fields. Required fields must be mapped for successful export.
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
                        addLog('Template field mappings configured', 'success');
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Apply Mappings
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
                  </label>
                </div>
                {files.commissions && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    File uploaded ({fileFields.commissions.length} fields detected)
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
                  </label>
                </div>
                {files.orders && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    File uploaded ({fileFields.orders.length} fields detected)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processing Button */}
        {files.commissions && files.orders && step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Process</h3>
                <p className="text-gray-600">
                  Configure template field mappings and process your data files.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    initializeTemplateMappings();
                    setShowTemplateConfig(true);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Settings className="mr-2" size={16} />
                  Configure Mappings
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.stats.totalRecords}</div>
                  <div className="text-sm text-gray-600">Cross-Referenced Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.stats.totalGenerated}</div>
                  <div className="text-sm text-gray-600">Template Records Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{results.stats.commissionFields}</div>
                  <div className="text-sm text-gray-600">Commission Fields</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{results.stats.orderFields}</div>
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
                  Reconfigure Mappings
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(templateRequirements).map(([templateType, template]) => {
                  const Icon = template.icon;
                  const colorClasses = getTemplateColorClasses(template.color);
                  const data = results.templates[templateType] || [];
                  const mappings = templateMappings[templateType] || {};
                  const mappedCount = Object.values(mappings).filter(m => m.enabled && m.sourceField).length;
                  
                  return (
                    <button
                      key={templateType}
                      onClick={() => {
                        exportToCSV(data, `${systemPatterns[results.systemType]?.name || 'Generic'}_${templateType}_template.csv`);
                      }}
                      disabled={!enabledTemplates[templateType] || data.length === 0}
                      className={`p-4 rounded-lg flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        enabledTemplates[templateType] && data.length > 0
                          ? `${colorClasses.button} text-white` 
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Icon className="mb-2" size={20} />
                      <span className="font-medium">{template.name}</span>
                      <span className="text-sm opacity-90">
                        {mappedCount} fields mapped • {data.length} records
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Tables */}
            <div className="space-y-6">
              {Object.entries(templateRequirements).map(([templateType, template]) => {
                if (!enabledTemplates[templateType]) return null;
                
                const data = results.templates[templateType] || [];
                if (data.length === 0) return null;
                
                const Icon = template.icon;
                const colorClasses = getTemplateColorClasses(template.color);
                const fieldsToShow = Object.keys(data[0] || {}).slice(0, 6);
                
                return (
                  <div key={templateType} className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${colorClasses.text}`}>
                      <Icon className="mr-2" size={20} />
                      {template.name} Preview
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Showing {fieldsToShow.length} of {Object.keys(data[0] || {}).length} fields)
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
                      Showing first 3 rows. Download full CSV for complete data with all mapped fields.
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