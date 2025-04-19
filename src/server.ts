/**
 * ATTOM MCP Server
 * 
 * This file implements the MCP server for the ATTOM API.
 * It exposes the ATTOM API functionality through the MCP protocol while
 * maintaining the CLI interface.
 */

import express, { Request, Response, Router, NextFunction, Express } from 'express';
import { AttomService } from './services/attomService.js';
// Import what we need from queryManager
import { executeQuery, applyAddressToGeoIdFallback } from './services/queryManager.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const router = Router();
const PORT = process.env.PORT ?? 3000;

// Create ATTOM service instance
const attomService = new AttomService();

// Centralized error handler to reduce verbosity
const handleError = (res: express.Response, error: unknown) => {
  // Only log errors in development environment
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
  return res.status(500).json({ 
    error: error instanceof Error ? error.message : 'Unknown error',
    status: 'error'
  });
};

// Middleware
// Apply CORS middleware - uncomment if needed for browser clients
// app.use(cors()); 
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => { 
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MCP endpoint for property sales history
router.post('/get_property_sales_history', async (req: Request, res: Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for sale detail
router.post('/get_sale_detail', async (req: express.Request, res: express.Response) => { 
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
    return handleError(res, error);
  }
});

// MCP endpoint for sale snapshot
router.post('/get_sale_snapshot', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for all events snapshot
router.post('/get_all_events_snapshot', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for sales comparables by address
router.post('/get_sales_comparables_address', async (req: express.Request, res: express.Response) => {
  try {
    const { street, city, county, state, zip, searchType, minComps, maxComps, miles } = req.body;
    const data = await attomService.getSalesComparablesAddress({ 
      street, city, county, state, zip, searchType, minComps, maxComps, miles 
    });
    return res.status(200).json(data);
  } catch (error: unknown) {
    return handleError(res, error);
  }
});

// MCP endpoint for sales comparables by property ID
router.post('/get_sales_comparables_propid', async (req: express.Request, res: express.Response) => {
  try {
    const { propId, searchType, minComps, maxComps, miles } = req.body;
    const data = await attomService.getSalesComparablesPropId({ 
      propId, searchType, minComps, maxComps, miles 
    });
    return res.status(200).json(data);
  } catch (error: unknown) {
    return handleError(res, error);
  }
});

// MCP endpoint for geographic boundary
router.post('/get_geographic_boundary', async (req: express.Request, res: express.Response) => {
  try {
    const { format, geoIdV4 } = req.body;
    const data = await attomService.getGeographicBoundary({ format, geoIdV4 });
    return res.status(200).json(data);
  } catch (error: unknown) {
    return handleError(res, error);
  }
});

// MCP endpoint for school profile
router.post('/get_school_profile', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for school district
router.post('/get_school_district', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for transportation noise
router.post('/get_transportation_noise', async (req: express.Request, res: express.Response) => {
  try {
    const { address } = req.body;
    const data = await attomService.getTransportationNoise({ address });
    return res.status(200).json(data);
  } catch (error: unknown) {
    return handleError(res, error);
  }
});

// MCP endpoint for property basic profile
router.post('/get_property_basic_profile', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for property building permits
router.post('/get_building_permits', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for property detail with owner
router.post('/get_property_detail_owner', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for community profile
router.post('/get_community_profile', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for school search
router.post('/search_schools', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for points of interest search
router.post('/search_poi', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for all events detail
router.post('/get_all_events_detail', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.body;
    const data = await attomService.getAllEventsDetail({ id });
    return res.status(200).json(data);
  } catch (error: unknown) {
    return handleError(res, error);
  }
});

// MCP endpoint for property mortgage details
router.post('/get_property_mortgage_details', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for property detail mortgage owner
router.post('/get_property_detail_mortgage_owner', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for property AVM detail
router.post('/get_property_avm_detail', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for property assessment detail
router.post('/get_property_assessment_detail', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for property home equity
router.post('/get_property_home_equity', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for property rental AVM
router.post('/get_property_rental_avm', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for AVM snapshot
router.post('/get_avm_snapshot', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for AVM history detail
router.post('/get_avm_history_detail', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for property details with schools
router.post('/get_property_details_with_schools', async (req: express.Request, res: express.Response) => {
  try {
    const { attomid } = req.body;
    const data = await attomService.getPropertyDetailsWithSchools({ attomid });
    return res.status(200).json(data);
  } catch (error: unknown) {
    return handleError(res, error);
  }
});

// MCP endpoint for sales history snapshot
router.post('/get_sales_history_snapshot', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for sales history basic
router.post('/get_sales_history_basic', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for sales history expanded
router.post('/get_sales_history_expanded', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// MCP endpoint for sales history detail
router.post('/get_sales_history_detail', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// Generic endpoint for any ATTOM API query
router.post('/execute_query', async (req: express.Request, res: express.Response) => {
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
    return handleError(res, error);
  }
});

// Register routes
app.use('/mcp', router);

// Global error handler middleware (example, customize as needed)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => { 
  console.error(err.stack);
  // Avoid sending detailed errors in production
  const statusCode = (err as any).status ?? 500; // Use a custom status if available
  return res.status(statusCode).json({
    error: err.message,
    status: 'error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`ATTOM MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
