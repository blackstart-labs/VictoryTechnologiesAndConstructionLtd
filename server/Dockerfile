# Stage 1: Build & Restore
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy CSPROJ and restore dependencies
COPY ["VDCBD.API/VDCBD.API.csproj", "VDCBD.API/"]
RUN dotnet restore "VDCBD.API/VDCBD.API.csproj"

# Copy the entire source tree and build in Release mode
COPY . .
WORKDIR "/src/VDCBD.API"
RUN dotnet build "VDCBD.API.csproj" -c Release -o /app/build

# Publish output files
FROM build AS publish
RUN dotnet publish "VDCBD.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Clean Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port and configure environment URLs
ENV ASPNETCORE_URLS=http://+:5237
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5237

ENTRYPOINT ["dotnet", "VDCBD.API.dll"]
