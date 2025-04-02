export const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// export const LOGIN = '${BASE_URL}/auth/login';
export const LOGIN = `${BASE_URL}/auth/login`;
export const UpdatePassword =`${BASE_URL}/auth/updatePassword`;
export const ForgotPassword =`${BASE_URL}/auth/forgotPassword`;

export const Dashboard_API=`${BASE_URL}/doc/dashboard`;
export const DepartmentDashboard_API =`${BASE_URL}/doc/departmentDashboard`;
export const createTenantSettings=`${BASE_URL}/admin/createTenantSettings`;
export const updateTenantSettings=`${BASE_URL}/admin/updateTenantSettings`;
export const getTenantSettings=`${BASE_URL}/admin/getTenantSettings`;

export const CREATEORUPDATE_USERS_API = `${BASE_URL}/admin/createOrUpdateUser`;
export const GETALLUSERS_API = `${BASE_URL}/admin/getAllUsers`;
export const GETALLUSERSBYID_API = `${BASE_URL}/admin/getUserById`;
export const DELETEUSERSBYID_API = `${BASE_URL}/admin/deleteUser`;

export const CREATEORUPDATE_ROLES_API = `${BASE_URL}/admin/createOrUpdateRole`;
export const GETALLROLESS_API = `${BASE_URL}/admin/getAllRoles`;
export const GETALLROLESBYID_API = `${BASE_URL}/admin/getRoleById`;
export const DELETEROLESBYID_API = `${BASE_URL}/admin/deleteRole`;

export const GetAllReference=`${BASE_URL}/admin/getAllData`;
export const createParentOrChindreference=`${BASE_URL}/admin/createParentOrChindreference`;
export const PostSubReference=`${BASE_URL}/admin/sub-reference`;
export const GetReferenceById=`${BASE_URL}/admin/getByIdReferences`;
export const updateParentOrChindreference=`${BASE_URL}/admin/reference`;
export const GetAllParentReference=`${BASE_URL}/admin/parents`;

export const DeleteReference=`${BASE_URL}/admin/reference`;

export const getProjects=`${BASE_URL}/admin/listProjectTypes`;
export const createProject=`${BASE_URL}/admin/addProjectType`;
export const updateProject=`${BASE_URL}/admin/updateProjectType`;
export const deleteProjectType=`${BASE_URL}/admin/deleteProjectType`;
export const getProjectTypeById=`${BASE_URL}/admin/getProjectTypeById`;

export const GET_DOCUMENT_COMMENTS_API = `${BASE_URL}/doc/comments`;
export const ADD_DOCUMENT_COMMENT_API=`${BASE_URL}/doc/createComment`;

export const ADD_DOCUMENT_API=`${BASE_URL}/doc/createDocument`;
export const UPDATE_DOCUMENT_API=`${BASE_URL}/doc/updateDocument`;
export const GET_DOCUMENT_API=`${BASE_URL}/doc/getDocumentById`;
export const GET_ALL_DOCUMENT_API=`${BASE_URL}/doc/getAllDocuments`;
export const FETCH_PERMISSION_URL = `${BASE_URL}/admin/getAllPermissions`;

export const FETCH_PERMISSION_URL_BY_ROLEID = `${BASE_URL}/admin/getAllPermissionsByRoleId`;

export const CREATE_OR_UPDATE_ROLE_URL = `${BASE_URL}/admin/createOrUpdateRolePermissions`;
export const COUNTRIES_API = `${BASE_URL}/admin/getCountries`;

export const VerifyOTP =`${BASE_URL}/users/validateOtp`;

export const ResetPassword =`${BASE_URL}/users/validateOtpAndUpdatePassword`;
