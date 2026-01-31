import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse, Http404
from .models import Dataset
from .serializers import DatasetSerializer
from .pdf_utils import generate_dataset_pdf


REQUIRED_COLUMNS = {
    "Equipment Name",
    "Type",
    "Flowrate",
    "Pressure",
    "Temperature"
}


class UploadCSV(APIView):
    """Handle CSV file uploads and data processing."""

    def post(self, request):
        file = request.FILES.get("file")

        if not file:
            return Response(
                {"error": "CSV file is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not file.name.endswith(".csv"):
            return Response(
                {"error": "Only CSV files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            df = pd.read_csv(file)
        except Exception:
            return Response(
                {"error": "Invalid CSV format"},
                status=status.HTTP_400_BAD_REQUEST
            )

        missing_cols = REQUIRED_COLUMNS - set(df.columns)
        if missing_cols:
            return Response(
                {
                    "error": "Missing required columns",
                    "missing_columns": list(missing_cols)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate summary statistics
        summary = {
            "total_equipment": int(len(df)),
            "avg_flowrate": float(df["Flowrate"].mean()),
            "avg_pressure": float(df["Pressure"].mean()),
            "avg_temperature": float(df["Temperature"].mean()),
            "type_distribution": df["Type"].value_counts().to_dict()
        }

        # Save to database
        Dataset.objects.create(
            filename=file.name,
            summary=summary
        )

        # Keep only last 5 datasets
        datasets = Dataset.objects.order_by("-uploaded_at")
        if datasets.count() > 5:
            for old in datasets[5:]:
                old.delete()

        return Response(
            {
                "message": "CSV uploaded successfully",
                "summary": summary
            },
            status=status.HTTP_201_CREATED
        )


class DatasetHistory(APIView):
    """Return the last 5 uploaded datasets."""

    def get(self, request):
        datasets = Dataset.objects.order_by("-uploaded_at")[:5]
        serializer = DatasetSerializer(datasets, many=True)
        return Response(serializer.data)


class DatasetPDF(APIView):
    """Generate and download PDF report for a dataset."""

    def get(self, request, dataset_id):
        try:
            dataset = Dataset.objects.get(id=dataset_id)
        except Dataset.DoesNotExist:
            raise Http404("Dataset not found")

        pdf_buffer = generate_dataset_pdf(dataset)

        return FileResponse(
            pdf_buffer,
            as_attachment=True,
            filename=f"{dataset.filename}_report.pdf",
            content_type="application/pdf",
        )
