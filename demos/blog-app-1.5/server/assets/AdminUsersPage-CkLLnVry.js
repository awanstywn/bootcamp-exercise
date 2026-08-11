import { i as api } from "../entry-server.js";
import { t as ConfirmModal } from "./ConfirmModal-BC5AV9Kg.js";
import { useCallback, useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import toast from "react-hot-toast";
//#region src/pages/admin/AdminUsersPage.tsx
/**
* @fileoverview Admin Users Management Page
* @objective Allow administrators to view all registered users and modify their roles (e.g., promote to Editor).
* @risk Modifying roles without a proper backend audit log could lead to untraceable privilege escalation.
* @relations Route: `/admin/users`. Interacts with `api.patch('/admin/users/:id/role')`.
* @logic
* - `fetchUsers`: Mocks fetching a list of users by just loading the current user (placeholder for demo).
* - `handleChangeRole`: Triggers a PATCH request to update the user's role in the database.
* - Renders a table displaying users and a dropdown to select their role.
*/
function AdminUsersPage() {
	const [users, setUsers] = useState([]);
	const [roleRequests, setRoleRequests] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pendingRoleChange, setPendingRoleChange] = useState(null);
	const [isChangingRole, setIsChangingRole] = useState(false);
	const fetchData = useCallback(async () => {
		try {
			setError(null);
			const [usersRes, requestsRes] = await Promise.all([api.get("/admin/users"), api.get("/admin/role-requests")]);
			setUsers(usersRes.data);
			setRoleRequests(requestsRes.data);
		} catch (err) {
			console.error("Failed to load data:", err);
			setError("Failed to load data. Please try again later.");
		} finally {
			setIsLoading(false);
		}
	}, []);
	useEffect(() => {
		setTimeout(() => {
			fetchData();
		}, 0);
	}, [fetchData]);
	const executeRoleChange = async () => {
		if (!pendingRoleChange) return;
		setIsChangingRole(true);
		try {
			await api.patch(`/admin/users/${pendingRoleChange.id}/role`, { role: pendingRoleChange.role });
			toast.success("Role updated successfully");
			await fetchData();
			setPendingRoleChange(null);
		} catch (_err) {
			toast.error("Failed to update role. Please try again.");
		} finally {
			setIsChangingRole(false);
		}
	};
	const handleRequestAction = async (requestId, status) => {
		try {
			await api.patch(`/admin/role-requests/${requestId}`, { status });
			toast.success(`Request ${status.toLowerCase()} successfully`);
			await fetchData();
		} catch (_err) {
			toast.error("Failed to update request. Please try again.");
		}
	};
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-bold mb-6",
			children: "Manage Users"
		}),
		error && /* @__PURE__ */ jsx("div", {
			className: "mb-6 p-4 bg-red-50 text-red-600 rounded-lg",
			children: error
		}),
		/* @__PURE__ */ jsx("h2", {
			className: "text-xl font-bold mb-4 font-serif",
			children: "Pending Role Requests"
		}),
		/* @__PURE__ */ jsx("div", {
			className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12",
			children: /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 border-b border-slate-200 text-slate-600",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "User"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Requested Role"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Reason"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100",
						children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 4,
							className: "px-6 py-8 text-center text-slate-500",
							children: "Loading requests..."
						}) }) : roleRequests.filter((r) => r.status === "PENDING").length > 0 ? roleRequests.filter((r) => r.status === "PENDING").map((request) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 transition-colors",
							children: [
								/* @__PURE__ */ jsxs("td", {
									className: "px-6 py-4",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-medium text-slate-900",
										children: String(request.user?.name || "Unknown User")
									}), /* @__PURE__ */ jsx("div", {
										className: "text-slate-500 text-xs",
										children: String(request.user?.email || "")
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 font-medium text-indigo-600",
									children: String(request.requestedRole)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-slate-600 italic max-w-xs truncate",
									title: String(request.reason || ""),
									children: String(request.reason || "No reason provided")
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "px-6 py-4 text-right space-x-2",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => handleRequestAction(String(request.id), "APPROVED"),
										className: "px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium",
										children: "Approve"
									}), /* @__PURE__ */ jsx("button", {
										onClick: () => handleRequestAction(String(request.id), "REJECTED"),
										className: "px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium",
										children: "Reject"
									})]
								})
							]
						}, String(request.id))) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 4,
							className: "px-6 py-8 text-center text-slate-500",
							children: "No pending role requests."
						}) })
					})]
				})
			})
		}),
		/* @__PURE__ */ jsx("h2", {
			className: "text-xl font-bold mb-4 font-serif",
			children: "All Users"
		}),
		/* @__PURE__ */ jsx("div", {
			className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden",
			children: /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 border-b border-slate-200 text-slate-600",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "User"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Email"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Role"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100",
						children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 4,
							className: "px-6 py-8 text-center text-slate-500",
							children: "Loading users..."
						}) }) : users.length > 0 ? users.map((user) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 transition-colors",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 font-medium text-slate-900",
									children: user.name
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-slate-600",
									children: user.email
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4",
									children: /* @__PURE__ */ jsx("span", {
										className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : user.role === "AUTHOR" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-800"}`,
										children: user.role
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-right",
									children: /* @__PURE__ */ jsxs("select", {
										className: "border border-slate-200 rounded px-2 py-1 text-sm mr-2 outline-none",
										value: user.role,
										onChange: (e) => setPendingRoleChange({
											id: user.id,
											name: user.name,
											oldRole: user.role,
											role: e.target.value
										}),
										"aria-label": `Change role for ${user.name}`,
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "SUBSCRIBER",
												children: "Subscriber"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "AUTHOR",
												children: "Author"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "ADMIN",
												children: "Admin"
											})
										]
									})
								})
							]
						}, user.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 4,
							className: "px-6 py-8 text-center text-slate-500",
							children: "No users found."
						}) })
					})]
				})
			})
		}),
		/* @__PURE__ */ jsx(ConfirmModal, {
			isOpen: !!pendingRoleChange,
			title: "Change User Role",
			message: /* @__PURE__ */ jsxs("p", { children: [
				"Are you sure you want to change ",
				/* @__PURE__ */ jsx("strong", { children: pendingRoleChange?.name }),
				"'s role from ",
				/* @__PURE__ */ jsx("span", {
					className: "font-semibold text-slate-500",
					children: pendingRoleChange?.oldRole
				}),
				" ",
				"to ",
				/* @__PURE__ */ jsx("span", {
					className: "font-bold text-indigo-600",
					children: pendingRoleChange?.role
				}),
				"? This will immediately affect their access and permissions on the platform."
			] }),
			confirmText: "Change Role",
			onConfirm: executeRoleChange,
			onCancel: () => setPendingRoleChange(null),
			isLoading: isChangingRole
		})
	] });
}
//#endregion
export { AdminUsersPage as default };
