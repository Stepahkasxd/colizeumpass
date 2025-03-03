
import { PassDetails } from "@/components/passes/PassDetails";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const PassDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
    // Log the passId when the component mounts
    console.log("PassDetailsPage mounted with ID:", id);
  }, [id]);

  return <PassDetails />;
};

export default PassDetailsPage;
