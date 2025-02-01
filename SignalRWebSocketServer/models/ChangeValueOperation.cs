namespace SignalRWebSocketServer.Models
{
    public class ChangeValueOperation
    {

        public int Id { get; set; }
        public decimal Value { get; set; }

        public ChangeValueOperation(int id, decimal value)
        {
            Id = id;
            Value = value;
        }


    }
}