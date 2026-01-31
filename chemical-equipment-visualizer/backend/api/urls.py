from django.urls import path
from .views import UploadCSV, DatasetHistory, DatasetPDF

urlpatterns = [
    path("upload/", UploadCSV.as_view(), name="upload"),
    path("history/", DatasetHistory.as_view(), name="history"),
    path("report/<int:dataset_id>/", DatasetPDF.as_view(), name="report"),
]
