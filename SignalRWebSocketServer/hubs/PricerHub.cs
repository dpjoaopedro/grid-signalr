using Microsoft.AspNetCore.SignalR;
using SignalRWebSocketServer.Models;

namespace SignalRWebSocketServer.Hubs
{
    public class PricerHub : Hub
    {
        private readonly Random _random = new Random();

        private Operation GenerateRandomOperation(int id)
        {
            string[] types = { "Buy", "Sell", "Trade" };
            string[] statuses = { "Pending", "Completed", "Cancelled" };
            string[] currencies = { "USD", "EUR", "GBP", "JPY" };
            string[] markets = { "NYSE", "NASDAQ", "LSE", "TSE" };
            string[] traders = { "John", "Alice", "Bob", "Carol" };
            string[] categories = { "Stocks", "Bonds", "Forex", "Crypto" };

            var operation = new Operation(
                id,
                types[_random.Next(types.Length)],
                (decimal)(_random.NextDouble() * 1000),
                DateTime.Now.AddDays(-_random.Next(30)),
                $"Operation {id}",
                (decimal)(_random.NextDouble() * 10000)
            );

            operation.Status = statuses[_random.Next(statuses.Length)];
            operation.Currency = currencies[_random.Next(currencies.Length)];
            operation.Market = markets[_random.Next(markets.Length)];
            operation.Fee = (decimal)(_random.NextDouble() * 100);
            operation.TraderName = traders[_random.Next(traders.Length)];
            operation.Quantity = _random.Next(1, 1000);
            operation.Price = (decimal)(_random.NextDouble() * 1000);
            operation.Category = categories[_random.Next(categories.Length)];
            operation.IsActive = _random.Next(2) == 1;
            operation.Priority = _random.Next(1, 6);

            return operation;
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("ReceiveConnectionId", Context.ConnectionId);

            var operations = Enumerable.Range(1, 10000)
                .Select(id => GenerateRandomOperation(id))
                .ToList();

            await Task.Delay(2000);
            await Clients.Caller.SendAsync("ReceiveInitialOperations", operations);
            await base.OnConnectedAsync();
        }

        public async Task SendOperation(Operation operation)
        {
            await Task.Delay(200); 
            await Clients.All.SendAsync("ReceiveOperation", operation);
        }

        public async Task ChangeOperationValue(ChangeValueOperation changeValueOperation)
        {
            await Clients.All.SendAsync("ReceiveChangeOperationValue", changeValueOperation);
        }
    }
}