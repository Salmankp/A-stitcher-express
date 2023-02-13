const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const standardizedFieldObject = {
  text: null, status: '', source: '',
};
const standardizedFieldObjectValues = {
  values: [], status: '', source: '',
};
const projectSchema = new mongoose.Schema({
  propertyReferences: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'property',
      default: null,
    },
  ],
  prefixCategories: {type: Array, default: null},
  suffixCategories: {type: Array, default: null},

  caseReferences: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'case',
      default: null,
    },
  ],
  documentReferences: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'document',
      default: null,
    },
  ],
  entityReferences: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'entity',
      default: null,
    },
  ],
  meetingReferences: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'meeting',
      default: null,
    },
  ],
  timeToIngest: {type: String, trim: true, default: null},
  project_description_present_use: {
    type: Object, default: standardizedFieldObject,
  },
  project_description_proposed_use: {
    type: Object, default: standardizedFieldObject,
  },
  project_description_project_name: {
    type: Object, default: standardizedFieldObject,
  },
  project_description_details: {
    type: Object, default: standardizedFieldObject,
  },
  project_description_addition_information_attached: {
    type: Object, default: standardizedFieldObject,
  },
  site_is_undeveloped: {
    type: Object,
    default: standardizedFieldObject,
  },
  site_is_located_within_500_feet_of_a_freeway: {
    type: Object, default: standardizedFieldObject,
  },
  site_has_existing_building: {
    type: Object, default: standardizedFieldObject,
  },
  site_is_located_within_500_feet_of_sensitive_use: {
    type: Object, default: standardizedFieldObject,
  },
  site_is_was_developed_with_use_that_could_release_hazardous_materials: {
    type: Object, default: standardizedFieldObject,
  },
  site_has_special_designation: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_removal_of_protected_trees: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_demolition_of_existing: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_new_construction: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_new_construction_square_feet: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_relocation_of_existing: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_accessory_use: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_interior_tenant_improvement: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_exterior_renovation: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_additions_to_existing_buildings: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_change_of_use: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_grading: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_haul_route: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_removal_of_any_on_site_trees: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_uses_or_structures_in_public_right_of_way: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_removal_of_any_street_tree: {
    type: Object, default: standardizedFieldObject,
  },
  proposed_project_info_phased_project: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_residential_existing: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_residential_demolished: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_residential_adding: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_residential_total: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_affordable_existing: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_affordable_demolished: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_affordable_adding: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_affordable_total: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_market_rate_existing: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_market_rate_demolished: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_market_rate_adding: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_market_rate_total: {
    type: Object, default: standardizedFieldObject,
  },
  housing_component_information_mixed_use_project: {
    type: Object, default: standardizedFieldObject,
  },
  public_right_of_way_have_you_submitted_to_BOE: {
    type: Object, default: standardizedFieldObject,
  },
  public_right_of_way_is_your_project_required_to_dedicate_land: {
    type: Object, default: standardizedFieldObject,
  },
  public_right_of_way_if_so_what_is_your_dedication_requirement: {
    type: Object, default: standardizedFieldObject,
  },
  public_right_of_way_information_dedication_requirement_multi_street: {
    type: Object, default: standardizedFieldObject,
  },
  action_requested_does_the_project_include_multiple_approval_requests_as_per_LAMC: {
    type: Object,
    default: standardizedFieldObject,
  },
  action_requested_additional_requests_attached: {
    type: Object, default: standardizedFieldObject,
  },
  action_requested: [{type: Object, default: null}],
  related_department_city_planning_cases_case_are_there_previous_or_pending_cases: {
    type: Object,
    default: standardizedFieldObject,
  },
  related_department_city_planning_case_if_yes_describe_other_partsrelated_documents_referrals_specialized_requirement_form: {
    type: Object,
    default: standardizedFieldObject,
  },
  related_department_city_planning_cases_if_yes_list_all_case: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_cases_if_yes_describe_the_other_parts: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_cases_case_no: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_cases_ordinance_no: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_cases_condition_compliance_review: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_cases_clarification_of_q: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_cases_modification_of_conditions: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_cases_clarification_of_d: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_revision_of_approved_plans: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_amendment_to_t: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_renewal_of_entitlement: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_plan_approval_subsequent_to_master_conditional_use: {
    type: Object,
    default: standardizedFieldObject,
  },
  related_department_city_planning_cases_for_purposes_of_environmental_CEQA: {
    type: Object, default: standardizedFieldObject,
  },
  related_department_city_planning_cases_have_you_filed_a_subdivision: {
    type: Object, default: standardizedFieldObject,
  },
  If_yes_describe_other_parts: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_specialized_requirement_form: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_geographic_project_planning_referral: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_citywide_urban_design_guidelines_checklist: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_affordable_housing_referral_form: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_mello_form: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_unpermitted_dwelling_unit: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_hpoz: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_management_team_authorization: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_expedite_fee_agreement: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_department_of_transportation: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_preliminary_zoning_assesment_referral_form: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_sb330_preliminary_application: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_bureau_of_engineering_planning_referral: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_bureau_of_engineering: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_are_there_outstanding_orders_to_comply: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_order_to_comply: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_building_permits: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_bureau_of_engineering_hillside_referral: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_hillside_referral_form: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_low_impact_development: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_housing_and_community_investment: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_proof_of_filing_housing_and_community_investment: {
    type: Object,
    default: standardizedFieldObject,
  },
  related_documents_referrals_are_there_recorded_covenants_or_easements: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_development_services_case_management_number: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_building_and_safety_plan: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_bureau_of_engineering_permit_number: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_bureau_of_sanitation_low_impact_development: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_other: {
    type: Object, default: standardizedFieldObject,
  },
  related_documents_referrals_sb330_determination_letter: {
    type: Object, default: standardizedFieldObject,
  },
  project_team_information_applicant_are_you_in_escrow_to_purchase_the_property: {
    type: Object,
    default: standardizedFieldObject,
  },
  project_location_legal_description: {
    type: Object, default: standardizedFieldObject,
  },
  property_owner_of_record_same_as_applicant: {
    type: Object, default: standardizedFieldObject,
  },
  primary_contact_for_project_information_owner: {
    type: Object, default: standardizedFieldObject,
  },
  primary_contact_for_project_information_applicant: {
    type: Object, default: standardizedFieldObject,
  },
  primary_contact_for_project_information_agent_representative: {
    type: Object, default: standardizedFieldObject,
  },
  primary_contact_for_project_information_agent_other: {
    type: Object, default: standardizedFieldObject,
  },
  project_location_parcel_number: {
    type: Object, default: standardizedFieldObject,
  },
  project_location_street_address: {
    type: Object, default: standardizedFieldObject,
  },
  project_location_total_lot_area_sq_feet: {
    type: Object, default: standardizedFieldObject,
  },
  project_location_total_lot_area_acres: {
    type: Object, default: standardizedFieldObject,
  },
  project_location_unit_space_number: {
    type: Object, default: standardizedFieldObject,
  },
  projectDescriptionPresentUse: {
    type: Object, default: standardizedFieldObjectValues,
  },
  projectDescriptionProposedUse: {
    type: Object, default: standardizedFieldObjectValues,
  },
  status: {type: String, trim: true, default: null},
  baseCases: {type: Array, default: null},
}, {
  timestamps: true, // strict: false,
  toJSON: {virtuals: true}, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: {virtuals: true}, // So `console.log()` and other functions that use `toObject()` include virtuals
});

// projectSchema.virtual('property', {
//   ref: 'property', // the collection/model name
//   localField: 'propId',
//   foreignField: '_id',
//   justOne: true, // default is false
// });

// projectSchema.index({ caseNbr: 1 });

projectSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('project', projectSchema);

// mongoQuery.where({ $text: { $search: searchtext } });
