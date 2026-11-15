// O NavLink do react-router ignora o hash, então "/" e "/#hidratacao" ficariam
// ativos ao mesmo tempo. Aqui o hash entra na comparação.
export function isNavItemActive(to, location) {
  const [path, hash = ""] = to.split("#");
  const currentHash = location.hash.replace(/^#/, "");
  if (path === "/") return location.pathname === "/" && currentHash === hash;
  return location.pathname === path || location.pathname.startsWith(`${path}/`);
}
