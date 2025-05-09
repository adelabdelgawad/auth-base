export interface Page {
  id: string;
  en_title: string;
  ar_title: string;
  en_description?: string;
  ar_description?: string;
  path: string;
  icon?: string;
}

export const pages: Page[] = [
  { 
    id: "1", 
    en_title: "Dashboard", 
    ar_title: "لوحة التحكم",
    en_description: "Overview of key metrics and system status.",
    ar_description: "نظرة عامة على المقاييس الرئيسية وحالة النظام.",
    path: "/dashboard", 
    icon: "layout-dashboard"
  },
  {
    id: "2",
    en_title: "Users",
    ar_title: "المستخدمين",
    en_description: "Manage application users and permissions.",
    ar_description: "إدارة مستخدمي التطبيق والصلاحيات.",
    path: "/admin/users",
    icon: "users"
  },
  {
    id: "3",
    en_title: "Roles",
    ar_title: "الأدوار",
    en_description: "Define and assign user roles.",
    ar_description: "تحديد وتعيين أدوار المستخدمين.",
    path: "/admin/roles",
    icon: "shield"
  },
  {
    id: "4",
    en_title: "Pages",
    ar_title: "الصفحات",
    en_description: "Manage site pages and content.",
    ar_description: "إدارة صفحات ومحتوى الموقع.",
    path: "/admin/pages",
    icon: "file"
  },
  { 
    id: "5", 
    en_title: "Settings", 
    ar_title: "الإعدادات",
    en_description: "Configure system preferences and options.",
    ar_description: "تكوين تفضيلات وخيارات النظام.",
    path: "/settings", 
    icon: "settings"
  },
  { 
    id: "6", 
    en_title: "Profile", 
    ar_title: "الملف الشخصي",
    en_description: "View and edit your user profile.",
    ar_description: "عرض وتعديل ملف المستخدم الخاص بك.",
    path: "/profile", 
    icon: "user"
  },
  { 
    id: "7", 
    en_title: "Reports", 
    ar_title: "التقارير",
    en_description: "Access analytics and system reports.",
    ar_description: "الوصول إلى التحليلات وتقارير النظام.",
    path: "/reports", 
    icon: "bar-chart"
  },
  {
    id: "8",
    en_title: "Sales Report",
    ar_title: "تقرير المبيعات",
    en_description: "View sales metrics and revenue data.",
    ar_description: "عرض مقاييس المبيعات وبيانات الإيرادات.",
    path: "/reports/sales",
    icon: "dollar-sign"
  },
  {
    id: "9",
    en_title: "User Activity",
    ar_title: "نشاط المستخدم",
    en_description: "Review user activity logs.",
    ar_description: "مراجعة سجلات نشاط المستخدم.",
    path: "/reports/activity",
    icon: "activity"
  },
  {
    id: "10",
    en_title: "Branches",
    ar_title: "الفروع",
    en_description: "Manage organization branches and locations.",
    ar_description: "إدارة فروع ومواقع المؤسسة.",
    path: "/settings/branchs",
    icon: "git-branch"
  },
  {
    id: "11",
    en_title: "Units",
    ar_title: "الوحدات",
    en_description: "Configure organizational units and departments.",
    ar_description: "تكوين الوحدات والأقسام التنظيمية.",
    path: "/settings/units",
    icon: "box"
  },
  {
    id: "12",
    en_title: "Unit Profile",
    ar_title: "ملف الوحدة",
    en_description: "Manage unit configurations and profiles.",
    ar_description: "إدارة إعدادات وملفات الوحدات.",
    path: "/settings/init-profile",
    icon: "clipboard"
  },
  {
    id: "13",
    en_title: "Branch Units",
    ar_title: "وحدات الفرع",
    en_description: "Connect branches with their respective units.",
    ar_description: "ربط الفروع بوحداتها المعنية.",
    path: "/settings/branch-unit",
    icon: "network"
  },
  {
    id: "14",
    en_title: "Voucher Status",
    ar_title: "حالة القسيمة",
    en_description: "Configure voucher statuses and lifecycle.",
    ar_description: "تكوين حالات دورة حياة القسائم.",
    path: "/settings/voucher-status",
    icon: "tag"
  },
  {
    id: "15",
    en_title: "Login Logs",
    ar_title: "سجلات الدخول",
    en_description: "View system access and authentication logs.",
    ar_description: "عرض سجلات الوصول والمصادقة للنظام.",
    path: "/reports/login-log",
    icon: "log-in"
  },
  {
    id: "16",
    en_title: "Audit Logs",
    ar_title: "سجلات التدقيق",
    en_description: "Review system changes and audit trail.",
    ar_description: "مراجعة تغييرات النظام ومسار التدقيق.",
    path: "/reports/audit-log",
    icon: "clipboard-list"
  },
];
