param(
    [Parameter(Mandatory=$true)]
    [string]$Tag,
    
    [Parameter(Mandatory=$false)]
    [switch]$PushToHub
)

# 构建前端镜像
docker build -f Dockerfile.frontend -t ddrenn/nocodb-frontend:$Tag .

# 构建后端镜像
docker build -f Dockerfile.backend -t ddrenn/nocodb-backend:$Tag .

if ($PushToHub) {
    # 推送镜像到 Docker Hub
    docker push ddrenn/nocodb-frontend:$Tag
    docker push ddrenn/nocodb-backend:$Tag
}