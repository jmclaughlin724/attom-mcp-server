// src/index.ts

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { AttomApiFramework } from './attomApiFramework';
import mcpHandler from './mcp_handler';

// Type definitions for yargs
type YargsArgv = yargs.Argv;
interface CommandArgs extends yargs.Arguments {
  [key: string]: unknown;
  attomid?: string;
  address1?: string;
  address2?: string;
  geoIdV4?: string;
  format?: string;
  radius?: number;
  categoryName?: string;
  point?: string;
  zipcode?: string;
  address?: string;
}

// Export MCP handler for MCP server integration
export default mcpHandler;

async function main() {
  const attom = new AttomApiFramework(process.env.ATTOM_API_KEY ?? 'demo-key');

  yargs(hideBin(process.argv))
    // Prefetch
    .command(
      'prefetch',
      'Prefetch address data (caches attomid, geoIdV4)',
      (yargs) => 
        yargs
          .option('address1', { type: 'string', demandOption: true })
          .option('address2', { type: 'string', demandOption: true }),
      async (argv) => {
        await attom.prefetchAddressData(
          argv.address1, 
          argv.address2
        );
        console.log('Prefetch done.');
      }
    )

    // property.basicprofile
    .command(
      'property basicprofile',
      'Basic property info + fallback from address if no attomid',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.property.basicprofile({
          attomid: argv.attomid,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // property.buildingpermits
    .command(
      'property buildingpermits',
      'Property + building permits detail',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.property.buildingpermits({
          attomid: argv.attomid,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // property.detailowner
    .command(
      'property detailowner',
      'Property detail + owner data',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.property.detailowner({
          attomid: argv.attomid,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // property.detailmortgage
    .command(
      'property detailmortgage',
      'Property detail + mortgage info',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.property.detailmortgage({
          attomid: argv.attomid,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // property.detailmortgageowner
    .command(
      'property detailmortgageowner',
      'Property detail + mortgage + owner combined',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.property.detailmortgageowner({
          attomid: argv.attomid,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // property.attomavmDetail
    .command(
      'property attomavmDetail',
      'Property AVM detail',
      (yargs) =>
        yargs
          .option('address1', { type: 'string', demandOption: true })
          .option('address2', { type: 'string', demandOption: true }),
      async (argv) => {
        const data = await attom.property.attomavmDetail({
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // property.homeequity
    .command(
      'property homeequity',
      'Property home equity valuation',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string', demandOption: true }),
      async (argv) => {
        const data = await attom.property.homeequity({
          attomid: argv.attomid,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // property.rentalavm
    .command(
      'property rentalavm',
      'Property rental AVM',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string', demandOption: true }),
      async (argv) => {
        const data = await attom.property.rentalavm({
          attomid: argv.attomid,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // property.avmSnapshot
    .command(
      'property avmSnapshot',
      'Property AVM snapshot',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string', demandOption: true }),
      async (argv) => {
        const data = await attom.property.avmSnapshot({
          attomid: argv.attomid,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // property.avmHistoryDetail
    .command(
      'property avmHistoryDetail',
      'Property AVM history detail',
      (yargs) =>
        yargs
          .option('address1', { type: 'string', demandOption: true })
          .option('address2', { type: 'string', demandOption: true }),
      async (argv) => {
        const data = await attom.property.avmHistoryDetail({
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // assessment.detail
    .command(
      'assessment detail',
      'Assessment detail',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.assessment.detail({
          attomid: argv.attomid,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // assessment.snapshot
    .command(
      'assessment snapshot',
      'Assessment snapshot',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.assessment.snapshot({
          attomid: argv.attomid,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // assessmenthistory.detail
    .command(
      'assessmenthistory detail',
      'Assessment history detail',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.assessmenthistory.detail({
          attomid: argv.attomid,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // saleshistory.detail
    .command(
      'saleshistory detail',
      'Sales history detail',
      (yargs) =>
        yargs
          .option('attomid', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.saleshistory.detail({
          attomid: argv.attomid,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // saleshistory.snapshot
    .command(
      'saleshistory snapshot',
      'Sales history snapshot',
      (yargs) =>
        yargs
          .option('geoIdV4', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' })
          .option('startsalesearchdate', { type: 'string', demandOption: true })
          .option('endsalesearchdate', { type: 'string', demandOption: true }),
      async (argv) => {
        const data = await attom.saleshistory.snapshot({
          geoIdV4: argv.geoIdV4,
          address1: argv.address1,
          address2: argv.address2,
          startsalesearchdate: argv.startsalesearchdate,
          endsalesearchdate: argv.endsalesearchdate,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // allevents.detail
    .command(
      'allevents detail',
      'All events detail',
      (yargs) =>
        yargs
          .option('id', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.allevents.detail({
          id: argv.id,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // allevents.snapshot
    .command(
      'allevents snapshot',
      'All events snapshot',
      (yargs) =>
        yargs
          .option('id', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.allevents.snapshot({
          id: argv.id,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // salescomparables.address
    .command(
      'salescomparables address',
      'Sales comparables by address',
      (yargs) =>
        yargs
          .option('street', { type: 'string', demandOption: true })
          .option('city', { type: 'string', demandOption: true })
          .option('county', { type: 'string', demandOption: true })
          .option('state', { type: 'string', demandOption: true })
          .option('zip', { type: 'string', demandOption: true })
          .option('searchType', { type: 'string', default: 'asIs' })
          .option('minComps', { type: 'number', default: 5 })
          .option('maxComps', { type: 'number', default: 20 })
          .option('miles', { type: 'number', default: 5 })
          .option('sqFtRange', { type: 'number', default: 300 })
          .option('lotSizeRange', { type: 'number', default: 2000 })
          .option('bedroomRange', { type: 'number', default: 1 })
          .option('bathroomRange', { type: 'number', default: 1 })
          .option('yearBuiltRange', { type: 'number', default: 10 })
          .option('saleDateRange', { type: 'number', default: 6 })
          .option('ownerOccupied', { type: 'string', default: 'Both' })
          .option('distressed', { type: 'string', default: 'IncludeDistressed' }),
      async (argv) => {
        // Create a properly typed params object for the address method
        const params = {
          street: argv.street,
          city: argv.city,
          county: argv.county,
          state: argv.state,
          zip: argv.zip,
          searchType: argv.searchType,
          minComps: argv.minComps,
          maxComps: argv.maxComps,
          miles: argv.miles,
          sqFtRange: argv.sqFtRange,
          lotSizeRange: argv.lotSizeRange,
          bedroomRange: argv.bedroomRange,
          bathroomRange: argv.bathroomRange,
          yearBuiltRange: argv.yearBuiltRange,
          saleDateRange: argv.saleDateRange,
          ownerOccupied: argv.ownerOccupied,
          distressed: argv.distressed,
        };
        const data = await attom.salescomparables.address(params);
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // salescomparables.propid
    .command(
      'salescomparables propid',
      'Sales comparables by property ID',
      (yargs) =>
        yargs
          .option('propId', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' })
          .option('searchType', { type: 'string', default: 'asIs' })
          .option('minComps', { type: 'number', default: 5 })
          .option('maxComps', { type: 'number', default: 20 })
          .option('miles', { type: 'number', default: 5 })
          .option('sqFtRange', { type: 'number', default: 300 })
          .option('lotSizeRange', { type: 'number', default: 2000 })
          .option('bedroomRange', { type: 'number', default: 1 })
          .option('bathroomRange', { type: 'number', default: 1 })
          .option('sqFeetRange', { type: 'number', default: 600 })
          .option('saleDateRange', { type: 'number', default: 12 })
          .option('yearBuiltRange', { type: 'number', default: 20 })
          .option('ownerOccupied', { type: 'string', default: 'Both' })
          .option('distressed', { type: 'string', default: 'IncludeDistressed' }),
      async (argv) => {
        const data = await attom.salescomparables.propid({ 
          ...argv as any,
          propId: argv.propId,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    // Example commands for area, poi, community, school
    .command(
      'area boundaryDetail',
      'Calls /v4/area/boundary/detail?geoIdV4=... fallback if needed',
      (yargs) =>
        yargs
          .option('geoIdV4', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' })
          .option('format', { type: 'string', default: 'geojson' }),
      async (argv) => {
        const data = await attom.area.boundaryDetail({
          geoIdV4: argv.geoIdV4,
          address1: argv.address1,
          address2: argv.address2,
          format: argv.format,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )
    .command(
      'poi search',
      'Calls /v4/neighborhood/poi with address or point or zip fallback',
      (yargs) =>
        yargs
          .option('address', { type: 'string' })
          .option('zipcode', { type: 'string' })
          .option('point', { type: 'string' })
          .option('radius', { type: 'number', default: 5 })
          .option('categoryName', { type: 'string', default: 'PERSONAL SERVICES' })
          .option('recordLimit', { type: 'number', default: 20 }),
      async (argv) => {
        const data = await attom.poi.search({
          address: argv.address,
          zipcode: argv.zipcode,
          point: argv.point,
          radius: argv.radius,
          categoryName: argv.categoryName,
          recordLimit: argv.recordLimit,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )
    .command(
      'community profile',
      'Calls /v4/neighborhood/community?geoIdV4=... fallback if needed',
      (yargs) =>
        yargs
          .option('geoIdV4', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.community.profile({
          geoIdV4: argv.geoIdV4,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )
    .command(
      'school profile',
      'Calls /v4/school/profile?geoIdV4=... fallback from address => SB code',
      (yargs) =>
        yargs
          .option('geoIdV4', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.school.profile({
          geoIdV4: argv.geoIdV4,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )
    .command(
      'school district',
      'Calls /v4/school/district?geoIdV4=... fallback from address => DB code',
      (yargs) =>
        yargs
          .option('geoIdV4', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' }),
      async (argv) => {
        const data = await attom.school.district({
          geoIdV4: argv.geoIdV4,
          address1: argv.address1,
          address2: argv.address2,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )
    .command(
      'school search',
      'Calls /v4/school/search?geoIdV4=... fallback from address => N2 code, radius, page, pageSize',
      (yargs) =>
        yargs
          .option('geoIdV4', { type: 'string' })
          .option('address1', { type: 'string' })
          .option('address2', { type: 'string' })
          .option('radius', { type: 'number', default: 5 })
          .option('page', { type: 'number', default: 1 })
          .option('pageSize', { type: 'number', default: 50 }),
      async (argv) => {
        const data = await attom.school.search({
          geoIdV4: argv.geoIdV4,
          address1: argv.address1,
          address2: argv.address2,
          radius: argv.radius,
          page: argv.page,
          pageSize: argv.pageSize,
        });
        console.log(JSON.stringify(data, null, 2));
      }
    )

    .help()
    .demandCommand()
    .parse();
}

main().catch(console.error);
