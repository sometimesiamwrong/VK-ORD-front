/**
 * Flow Templates Service
 *
 * Handles all API calls related to flow templates for VK ORD.
 * Flow templates allow users to save and reuse wizard configurations.
 *
 * @example
 * ```ts
 * // Get all wizard templates
 * const templates = await FlowTemplatesService.getTemplates({
 *   type: FlowTemplateType.VkOrdWizard,
 *   activeOnly: true
 * })
 *
 * // Load a specific template
 * const template = await FlowTemplatesService.getTemplateById(123)
 *
 * // Create new template
 * await FlowTemplatesService.createTemplate({
 *   name: 'My Template',
 *   type: FlowTemplateType.VkOrdWizard,
 *   value: {
 *     contractExternalId: 'contract-123',
 *     contractorExternalId: 'party-456',
 *     clientExternalId: 'party-789',
 *     creativeExternalId: 'creative-101'
 *   }
 * })
 * ```
 */

import http from '../api/http'
import type {
  FlowTemplateListResponse,
  FlowTemplateResponse,
  CreateFlowTemplateRequest,
  UpdateFlowTemplateRequest,
  UpdateFlowTemplateHeadersRequest,
  FlowTemplateTypesResponse,
  GetTemplatesParams
} from '../types/flowTemplates'

/**
 * Service class for flow template operations
 */
export class FlowTemplatesService {
  private static readonly BASE_URL = '/api/flow-templates'

  // ============================================
  // QUERIES - Read operations
  // ============================================

  /**
   * Get list of flow templates
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of templates
   *
   * @example
   * ```ts
   * const response = await FlowTemplatesService.getTemplates({
   *   type: 4,
   *   activeOnly: true,
   *   sort: 'last_used_at',
   *   order: 'desc',
   *   limit: 20
   * })
   * console.log(response.data) // Array of templates
   * console.log(response.pagination.total) // Total count
   * ```
   */
  static async getTemplates(params?: GetTemplatesParams): Promise<FlowTemplateListResponse> {
    const response = await http.get<FlowTemplateListResponse>(this.BASE_URL + "/v1", { params })
    return response.data
  }

  /**
   * Get a specific template by ID
   *
   * @param id - Template ID
   * @returns Full template with enriched data
   *
   * @example
   * ```ts
   * const template = await FlowTemplatesService.getTemplateById(123)
   * console.log(template.value) // Contains full contract, parties, creative objects
   * ```
   */
  static async getTemplateById(id: number): Promise<FlowTemplateResponse> {
    const response = await http.get<FlowTemplateResponse>(`${this.BASE_URL}/v1/${id}`)
    return response.data
  }

  /**
   * Get all available template types
   *
   * @returns List of template types with descriptions
   *
   * @example
   * ```ts
   * const types = await FlowTemplatesService.getTemplateTypes()
   * console.log(types.types) // Array of type definitions
   * ```
   */
  static async getTemplateTypes(): Promise<FlowTemplateTypesResponse> {
    const response = await http.get<FlowTemplateTypesResponse>(`${this.BASE_URL}/v1/types/all`)
    return response.data
  }

  // ============================================
  // MUTATIONS - Write operations
  // ============================================

  /**
   * Create a new flow template
   *
   * @param data - Template data to create
   * @returns Created template with assigned ID
   *
   * @example
   * ```ts
   * const template = await FlowTemplatesService.createTemplate({
   *   name: 'Production Flow',
   *   type: FlowTemplateType.VkOrdWizard,
   *   description: 'Template for production contracts',
   *   value: {
   *     contractExternalId: 'contract-123',
   *     contractorExternalId: 'party-456',
   *     clientExternalId: 'party-789',
   *     creativeExternalId: 'creative-101'
   *   },
   *   tags: ['production', 'standard']
   * })
   * ```
   */
  static async createTemplate(data: CreateFlowTemplateRequest): Promise<FlowTemplateResponse> {
    const response = await http.post<FlowTemplateResponse>(this.BASE_URL + "/v1", data)
    return response.data
  }

  /**
   * Update an existing template
   *
   * @param id - Template ID
   * @param data - Updated template data
   * @returns Updated template
   *
   * @example
   * ```ts
   * const updated = await FlowTemplatesService.updateTemplate(123, {
   *   name: 'Updated Name',
   *   description: 'Updated description'
   * })
   * ```
   */
  static async updateTemplate(id: number, data: UpdateFlowTemplateRequest): Promise<FlowTemplateResponse> {
    const response = await http.put<FlowTemplateResponse>(`${this.BASE_URL}/v1/${id}`, data)
    return response.data
  }

  /**
   * Update template headers (metadata only - name, description, tags, isActive)
   * Does not update the template value/content
   *
   * @param id - Template ID
   * @param data - Updated header data
   *
   * @example
   * ```ts
   * await FlowTemplatesService.updateTemplateHeaders(123, {
   *   name: 'Updated Name',
   *   description: 'Updated description',
   *   tags: ['tag1', 'tag2'],
   *   isActive: true
   * })
   * ```
   */
  static async updateTemplateHeaders(id: number, data: UpdateFlowTemplateHeadersRequest): Promise<void> {
    await http.put(`${this.BASE_URL}/v1/${id}/headers`, data)
  }

  /**
   * Delete a template (soft delete)
   *
   * @param id - Template ID to delete
   *
   * @example
   * ```ts
   * await FlowTemplatesService.deleteTemplate(123)
   * ```
   */
  static async deleteTemplate(id: number): Promise<void> {
    await http.delete(`${this.BASE_URL}/v1/${id}`)
  }

  /**
   * Activate or deactivate a template
   *
   * @param id - Template ID
   * @param isActive - Whether template should be active
   *
   * @example
   * ```ts
   * await FlowTemplatesService.activateTemplate(123, false) // Deactivate
   * await FlowTemplatesService.activateTemplate(123, true)  // Activate
   * ```
   */
  static async activateTemplate(id: number, isActive: boolean): Promise<void> {
    await http.patch(`${this.BASE_URL}/v1/${id}/activate`, { isActive })
  }

  /**
   * Increment template use count
   * Should be called when user applies a template
   *
   * @param id - Template ID
   *
   * @example
   * ```ts
   * // User selected template to load
   * await FlowTemplatesService.incrementUseCount(123)
   * ```
   */
  static async incrementUseCount(id: number): Promise<void> {
    await http.post(`${this.BASE_URL}/v1/${id}/use`)
  }
}

export default FlowTemplatesService
