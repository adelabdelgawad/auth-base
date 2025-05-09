import { getPages } from "@/actions/page-actions";
import PagesTable from "./pages-table";

async function adminPages() {
  const pages = await getPages();
  return <PagesTable pages={pages} />;
}

export default adminPages;
