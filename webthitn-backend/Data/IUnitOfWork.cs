using System;
using System.Threading.Tasks;

namespace webthitn_backend.Data
{
    /// <summary>
    /// Unit of work pattern interface
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        /// <summary>
        /// Get repository
        /// </summary>
        /// <typeparam name="TEntity">Entity type</typeparam>
        /// <returns>Repository</returns>
        IRepository<TEntity> Repository<TEntity>() where TEntity : class;

        /// <summary>
        /// Complete unit of work
        /// </summary>
        /// <returns>Number of changes</returns>
        Task<int> CompleteAsync();
    }
}