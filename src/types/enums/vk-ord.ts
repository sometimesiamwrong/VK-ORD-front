/**
 * VK ORD (Обязательная Регистрация Данных) Enums
 *
 * Contains all enum constants for VK's mandatory advertising data registration system.
 * These enums match the official VK ORD API specification.
 *
 * @see https://ads.vk.com/ord
 */

/**
 * Creative format types
 *
 * @example
 * ```ts
 * const creativeType = VkOrdCreativeForm.TextGraphicBlock // 2
 * ```
 */
export const VkOrdCreativeForm = {
  Banner: 0,
  TextBlock: 1,
  TextGraphicBlock: 2,
  Audio: 3,
  Video: 4,
  LiveAudio: 5,
  LiveVideo: 6,
  TextVideoBlock: 7,
  TextGraphicVideoBlock: 8,
  TextAudioBlock: 9,
  TextGraphicAudioBlock: 10,
  TextAudioVideoBlock: 11,
  TextGraphicAudioVideoBlock: 12,
  BannerHtml5: 13
} as const

export type VkOrdCreativeForm = typeof VkOrdCreativeForm[keyof typeof VkOrdCreativeForm]

/**
 * Payment types for advertising
 *
 * @example
 * ```ts
 * const paymentModel = VkOrdPayType.Cpm // Cost Per Mille (impressions)
 * ```
 */
export const VkOrdPayType = {
  Cpm: 0,    // Cost Per Mille (per 1000 impressions)
  Cpc: 1,    // Cost Per Click
  Cpa: 2,    // Cost Per Action (conversion)
  Cpview: 3  // Cost Per View
} as const

export type VkOrdPayType = typeof VkOrdPayType[keyof typeof VkOrdPayType]

/**
 * Roles of counterparties in advertising contracts
 *
 * @example
 * ```ts
 * const role = VkOrdPersonRoles.Advertiser // Рекламодатель
 * ```
 */
export const VkOrdPersonRoles = {
  Advertiser: 0,  // Рекламодатель
  Agency: 1,      // Рекламное агентство
  Ors: 2,         // Оператор рекламной системы
  Publisher: 3    // Издатель (площадка)
} as const

export type VkOrdPersonRoles = typeof VkOrdPersonRoles[keyof typeof VkOrdPersonRoles]

/**
 * Contract types
 */
export const VkOrdContractType = {
  Advertising: 0,                      // Рекламный договор
  AdvertisingWithDistribution: 1,      // С распространением
  AdvertisingWithProduction: 2         // С производством
} as const

export type VkOrdContractType = typeof VkOrdContractType[keyof typeof VkOrdContractType]

/**
 * Action types indicating who pays
 */
export const VkOrdActionType = {
  AdvertiserPays: 0,  // Рекламодатель платит
  AgencyPays: 1,      // Агентство платит
  PublisherPays: 2,   // Издатель платит
  OrsPays: 3          // ОРС платит
} as const

export type VkOrdActionType = typeof VkOrdActionType[keyof typeof VkOrdActionType]

/**
 * Subject types of advertising contracts
 */
export const VkOrdSubjectType = {
  Advertising: 0,                                 // Реклама
  AdvertisingWithDistribution: 1,                 // Реклама с распространением
  AdvertisingWithProduction: 2,                   // Реклама с производством
  AdvertisingWithDistributionAndProduction: 3,    // Реклама с распространением и производством
  SocialAdvertising: 4                            // Социальная реклама
} as const

export type VkOrdSubjectType = typeof VkOrdSubjectType[keyof typeof VkOrdSubjectType]

/**
 * Contract status flags
 */
export const VkOrdContractFlag = {
  IsActive: 0,    // Активный
  IsArchived: 1,  // Архивный
  IsDeleted: 2,   // Удаленный
  IsDraft: 3      // Черновик
} as const

export type VkOrdContractFlag = typeof VkOrdContractFlag[keyof typeof VkOrdContractFlag]

/**
 * Creative status flags
 */
export const VkOrdCreativeFlag = {
  IsActive: 0,    // Активный
  IsArchived: 1,  // Архивный
  IsDeleted: 2    // Удаленный
} as const

export type VkOrdCreativeFlag = typeof VkOrdCreativeFlag[keyof typeof VkOrdCreativeFlag]

/**
 * Person/entity types for counterparties
 */
export const VkOrdPersonType = {
  Individual: 0,              // Физическое лицо
  LegalEntity: 1,             // Юридическое лицо
  ForeignLegalEntity: 2,      // Иностранное юридическое лицо
  ForeignIndividual: 3,       // Иностранное физическое лицо
  Branch: 4,                  // Филиал
  RepresentativeOffice: 5     // Представительство
} as const

export type VkOrdPersonType = typeof VkOrdPersonType[keyof typeof VkOrdPersonType]
