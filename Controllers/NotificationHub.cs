using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TeamCommandCenter.Controllers
{
    public class NotificationHub : Hub
    {
        public async Task Initialize(string groupId)
        {
            // register this connection for the group passed in
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        }
    }
}