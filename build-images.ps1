# build-images.ps1
param(
    [Parameter(Mandatory=$false)]
    [string]$Tag = "20250925",
    [Parameter(Mandatory=$false)]
    [switch]$PushToHub
)

# 登录 Docker Hub
docker login -u ddrenn

# 构建前端镜像
docker build -t ddrenn/nocodb-frontend:$Tag -f Dockerfile .

# 构建后端镜像
docker build -t ddrenn/nocodb-backend:$Tag -f server/Dockerfile server/

# 如果启用推送，则推送镜像
if ($PushToHub) {
    docker push ddrenn/nocodb-frontend:$Tag
    docker push ddrenn/nocodb-backend:$Tag
}