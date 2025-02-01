namespace SignalRWebSocketServer.Models
{
    public class Operation
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public decimal Value { get; set; }
        public string Status { get; set; }
        public string Currency { get; set; }
        public string Market { get; set; }
        public decimal Fee { get; set; }
        public string TraderName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public bool IsActive { get; set; }
        public int Priority { get; set; }

        public Operation(int id, string type, decimal amount, DateTime date, string description, decimal value)
        {
            Id = id;
            Type = type;
            Amount = amount;
            Date = date;
            Description = description;
            Value = value;
            Status = "Pending";
            Currency = "USD";
            Market = "Default";
            Fee = 0;
            TraderName = "Unknown";
            Quantity = 1;
            Price = 0;
            Category = "General";
            IsActive = true;
            Priority = 1;
        }
    }
}