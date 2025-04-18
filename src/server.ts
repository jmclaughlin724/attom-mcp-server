/**
 * ATTOM MCP Server
 * 
 * This file implements the MCP server for the ATTOM API.
 * It exposes the ATTOM API functionality through the MCP protocol while
 * maintaining the CLI interface.
 */

import express from 'express';
import cors from 'cors';
import { AttomService } from './services/attomService';
// Import what we need from queryManager
import { executeQuery, applyAddressToGeoIdFallback } from './services/queryManager';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT ?? 3000;

// Create ATTOM service instance
const attomService = new AttomService();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MCP endpoint for property sales history
app.post('/mcp/get_property_sales_history', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    // Validate parameters based on YAML requirements
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: both address1 and address2 are required',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertySalesHistory({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_sales_history:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for sale detail
app.post('/mcp/get_sale_detail', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    // Validate parameters based on YAML requirements
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: both address1 and address2 are required',
        status: 'error'
      });
    }
    
    const data = await attomService.getSaleDetail({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_sale_detail:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for sale snapshot
app.post('/mcp/get_sale_snapshot', async (req, res) => {
  try {
    const { geoIdV4, startsalesearchdate, endsalesearchdate } = req.body;
    
    // Validate parameters based on YAML requirements
    if (!geoIdV4) {
      return res.status(400).json({
        error: 'Missing required parameter: geoIdV4 is required',
        status: 'error'
      });
    }
    
    const data = await attomService.getSaleSnapshot({ 
      geoIdV4, 
      startsalesearchdate, 
      endsalesearchdate 
    });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_sale_snapshot:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for all events snapshot
app.post('/mcp/get_all_events_snapshot', async (req, res) => {
  try {
    const { id } = req.body;
    
    // Validate parameters based on YAML requirements
    if (!id) {
      return res.status(400).json({
        error: 'Missing required parameter: id is required',
        status: 'error'
      });
    }
    
    const data = await attomService.getAllEventsSnapshot({ id });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_all_events_snapshot:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for sales comparables by address
app.post('/mcp/get_sales_comparables_address', async (req, res) => {
  try {
    const { street, city, county, state, zip, searchType, minComps, maxComps, miles } = req.body;
    const data = await attomService.getSalesComparablesAddress({ 
      street, city, county, state, zip, searchType, minComps, maxComps, miles 
    });
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_sales_comparables_address:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for sales comparables by property ID
app.post('/mcp/get_sales_comparables_propid', async (req, res) => {
  try {
    const { propId, searchType, minComps, maxComps, miles } = req.body;
    const data = await attomService.getSalesComparablesPropId({ 
      propId, searchType, minComps, maxComps, miles 
    });
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_sales_comparables_propid:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for geographic boundary
app.post('/mcp/get_geographic_boundary', async (req, res) => {
  try {
    const { format, geoIdV4 } = req.body;
    const data = await attomService.getGeographicBoundary({ format, geoIdV4 });
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_geographic_boundary:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for school profile
app.post('/mcp/get_school_profile', async (req, res) => {
  try {
    let { geoIdV4, address, address1, address2 } = req.body;
    
    // Try to convert address to geoIdV4 if needed
    if (!geoIdV4 && (address || (address1 && address2))) {
      try {
        // Use the address-to-geoIdV4 fallback to get a geoIdV4 code
        const params = { address, address1, address2 };
        const updatedParams = await applyAddressToGeoIdFallback('schoolProfile', params);
        geoIdV4 = updatedParams.geoIdV4;
        console.log(`[SchoolProfile] Converted address to geoIdV4: ${geoIdV4}`);
      } catch (conversionError) {
        console.warn(`[SchoolProfile] Failed to convert address to geoIdV4: ${conversionError}`);
      }
    }
    
    // Validate parameters based on YAML requirements
    if (!geoIdV4) {
      return res.status(400).json({
        error: 'Missing required parameter: geoIdV4 is required (or valid address to convert)',
        status: 'error'
      });
    }
    
    const data = await attomService.getSchoolProfile({ geoIdV4 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_school_profile:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for school district
app.post('/mcp/get_school_district', async (req, res) => {
  try {
    let { geoIdV4, address, address1, address2 } = req.body;
    
    // Try to convert address to geoIdV4 if needed
    if (!geoIdV4 && (address || (address1 && address2))) {
      try {
        // Use the address-to-geoIdV4 fallback to get a geoIdV4 code
        const params = { address, address1, address2 };
        const updatedParams = await applyAddressToGeoIdFallback('schoolDistrict', params);
        geoIdV4 = updatedParams.geoIdV4;
        console.log(`[SchoolDistrict] Converted address to geoIdV4: ${geoIdV4}`);
      } catch (conversionError) {
        console.warn(`[SchoolDistrict] Failed to convert address to geoIdV4: ${conversionError}`);
      }
    }
    
    // Validate parameters based on YAML requirements
    if (!geoIdV4) {
      return res.status(400).json({
        error: 'Missing required parameter: geoIdV4 is required (or valid address to convert)',
        status: 'error'
      });
    }
    
    const data = await attomService.getSchoolDistrict({ geoIdV4 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_school_district:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for transportation noise
app.post('/mcp/get_transportation_noise', async (req, res) => {
  try {
    const { address } = req.body;
    const data = await attomService.getTransportationNoise({ address });
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_transportation_noise:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property basic profile
app.post('/mcp/get_property_basic_profile', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    // Validate parameters based on YAML requirements
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: both address1 and address2 are required',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertyBasicProfile({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_basic_profile:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property building permits
app.post('/mcp/get_building_permits', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    // Validate parameters based on YAML requirements
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: both address1 and address2 are required',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertyBuildingPermits({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_building_permits:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property detail with owner
app.post('/mcp/get_property_detail_owner', async (req, res) => {
  try {
    const { attomid } = req.body;
    
    // Validate parameters based on YAML requirements
    if (!attomid) {
      return res.status(400).json({
        error: 'Missing required parameter: attomid is required',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertyDetailOwner({ attomid });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_detail_owner:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for community profile
app.post('/mcp/get_community_profile', async (req, res) => {
  try {
    const { geoIdV4 } = req.body;
    
    // Validate parameters based on YAML requirements
    if (!geoIdV4) {
      return res.status(400).json({
        error: 'Missing required parameter: geoIdV4 is required',
        status: 'error'
      });
    }
    
    const data = await attomService.getCommunityProfile({ geoIdV4 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_community_profile:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for school search
app.post('/mcp/search_schools', async (req, res) => {
  try {
    const { geoIdV4, radius, page, pageSize } = req.body;
    
    // Validate parameters based on YAML requirements
    if (!geoIdV4) {
      return res.status(400).json({
        error: 'Missing required parameter: geoIdV4 is required',
        status: 'error'
      });
    }
    
    const data = await attomService.searchSchools({ geoIdV4, radius, page, pageSize });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in search_schools:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for points of interest search
app.post('/mcp/search_poi', async (req, res) => {
  try {
    const { address, radius, categoryName, recordLimit } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Missing required parameter: address' });
    }
    
    const data = await attomService.searchPOI({ 
      address, 
      radius, 
      categoryName, 
      recordLimit 
    });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in search_poi:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for all events detail
app.post('/mcp/get_all_events_detail', async (req, res) => {
  try {
    const { id } = req.body;
    const data = await attomService.getAllEventsDetail({ id });
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_all_events_detail:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property mortgage details
app.post('/mcp/get_property_mortgage_details', async (req, res) => {
  try {
    const { attomid } = req.body;
    
    // Validate required parameter as per YAML spec
    if (!attomid) {
      return res.status(400).json({
        error: 'Missing required parameter: attomid',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertyMortgageDetails({ attomid });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_mortgage_details:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property detail mortgage owner
app.post('/mcp/get_property_detail_mortgage_owner', async (req, res) => {
  try {
    const { attomid } = req.body;
    
    // Validate required parameter as per YAML spec
    if (!attomid) {
      return res.status(400).json({
        error: 'Missing required parameter: attomid',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertyDetailMortgageOwner({ attomid });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_detail_mortgage_owner:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property AVM detail
app.post('/mcp/get_property_avm_detail', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: address1 and address2 are required',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertyAVMDetail({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_avm_detail:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property assessment detail
app.post('/mcp/get_property_assessment_detail', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    // Validate required parameters as per YAML spec
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: address1 and address2 are both required',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertyAssessmentDetail({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_assessment_detail:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property home equity
app.post('/mcp/get_property_home_equity', async (req, res) => {
  try {
    const { attomid } = req.body;
    
    if (!attomid) {
      return res.status(400).json({
        error: 'Missing required parameter: attomid is required',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertyHomeEquity({ attomid });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_home_equity:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property rental AVM
app.post('/mcp/get_property_rental_avm', async (req, res) => {
  try {
    const { attomid } = req.body;
    
    if (!attomid) {
      return res.status(400).json({
        error: 'Missing required parameter: attomid is required',
        status: 'error'
      });
    }
    
    const data = await attomService.getPropertyRentalAVM({ attomid });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_rental_avm:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for AVM snapshot
app.post('/mcp/get_avm_snapshot', async (req, res) => {
  try {
    const { attomid } = req.body;
    
    if (!attomid) {
      return res.status(400).json({
        error: 'Missing required parameter: attomid is required',
        status: 'error'
      });
    }
    
    const data = await attomService.getAvmSnapshot({ attomid });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_avm_snapshot:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for AVM history detail
app.post('/mcp/get_avm_history_detail', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: address1 and address2 are required',
        status: 'error'
      });
    }
    
    const data = await attomService.getAvmHistoryDetail({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_avm_history_detail:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for property details with schools
app.post('/mcp/get_property_details_with_schools', async (req, res) => {
  try {
    const { attomid } = req.body;
    const data = await attomService.getPropertyDetailsWithSchools({ attomid });
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_property_details_with_schools:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for sales history snapshot
app.post('/mcp/get_sales_history_snapshot', async (req, res) => {
  try { 
    const { attomid } = req.body;
    
    // Validate required parameters as per YAML spec
    if (!attomid) {
      return res.status(400).json({
        error: 'Missing required parameter: attomid is required',
        status: 'error'
      });
    }
    
    const data = await attomService.getSalesHistorySnapshot({ attomid });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_sales_history_snapshot:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for sales history basic
app.post('/mcp/get_sales_history_basic', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    // Validate required parameters as per YAML spec
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: address1 and address2 are both required',
        status: 'error'
      });
    }
    
    const data = await attomService.getSalesHistoryBasic({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_sales_history_basic:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for sales history expanded
app.post('/mcp/get_sales_history_expanded', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    // Validate required parameters as per YAML spec
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: address1 and address2 are both required',
        status: 'error'
      });
    }
    
    const data = await attomService.getSalesHistoryExpanded({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_sales_history_expanded:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// MCP endpoint for sales history detail
app.post('/mcp/get_sales_history_detail', async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    
    // Validate required parameters as per YAML spec
    if (!address1 || !address2) {
      return res.status(400).json({
        error: 'Missing required parameters: address1 and address2 are both required',
        status: 'error'
      });
    }
    
    const data = await attomService.getSalesHistoryDetail({ address1, address2 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in get_sales_history_detail:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});































// Generic endpoint for any ATTOM API query
app.post('/mcp/execute_query', async (req, res) => {
  try {
    const { endpointKey, params } = req.body;
    
    if (!endpointKey) {
      return res.status(400).json({ 
        error: 'Missing required parameter: endpointKey',
        status: 'error'
      });
    }
    
    const data = await executeQuery(endpointKey, params ?? {});
    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error in execute_query:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`ATTOM MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Available endpoints:');
  console.log('- /mcp/get_property_basic_profile');
  console.log('- /mcp/get_building_permits');
  console.log('- /mcp/get_property_detail_owner');
  console.log('- /mcp/get_property_mortgage_details');
  console.log('- /mcp/get_property_detail_mortgage_owner');
  console.log('- /mcp/get_property_avm_detail');
  console.log('- /mcp/get_property_assessment_detail');
  console.log('- /mcp/get_property_home_equity');
  console.log('- /mcp/get_property_rental_avm');
  console.log('- /mcp/get_property_details_with_schools');
  console.log('- /mcp/get_property_sales_history');
  console.log('- /mcp/get_sales_history_snapshot');
  console.log('- /mcp/get_sales_history_basic');
  console.log('- /mcp/get_sales_history_expanded');
  console.log('- /mcp/get_sales_history_detail');
  console.log('- /mcp/get_sale_detail');
  console.log('- /mcp/get_sale_snapshot');
  console.log('- /mcp/get_all_events_detail');
  console.log('- /mcp/get_all_events_snapshot');
  console.log('- /mcp/get_avm_snapshot');
  console.log('- /mcp/get_avm_history_detail');
  console.log('- /mcp/get_sales_comparables_address');
  console.log('- /mcp/get_sales_comparables_propid');
  console.log('- /mcp/get_geographic_boundary');
  console.log('- /mcp/get_community_profile');
  console.log('- /mcp/get_school_profile');
  console.log('- /mcp/get_school_district');
  console.log('- /mcp/search_schools');
  console.log('- /mcp/search_poi');
  console.log('- /mcp/get_transportation_noise');
  console.log('- /mcp/execute_query (generic endpoint)');
});
