export interface SchoolProfile {
  schoolName: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
}

export interface AcademicConfig {
  currentSessionId: string;
  currentTermId: string;
  autoPromoteStudents: boolean;
  lockPastResults: boolean;
}

export interface BrandingSettings {
  primaryColor: string;
  logoUrl?: string;
}

export interface NotificationPreferences {
  emailNotificationsEnabled: boolean;
  smsAlertsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
}

export interface TenantSettings
  extends
    SchoolProfile,
    AcademicConfig,
    BrandingSettings,
    NotificationPreferences {}

export type SettingsUpdateData = Partial<TenantSettings>;
